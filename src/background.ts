import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"; // note: we MUST use the sw version of the messaging API and NOT the one from "firebase/messaging"
import { getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { StorageKeys } from "./types/StorageKeys";
import LoginRequest from "./api/requests/LoginRequest";
import FcmTokenRegister from "./api/requests/FcmTokenRegister";
import LogoutRequest from "./api/requests/LogoutRequest";
import DateW3c from "./util/DateW3c";

const VAPID_KEY = "BG9ZzgwoZHtOmt7g2VBIQJHASK9VEAup7q7IS2q0XRCM6L75_ahO2kFW8zPwBRjqfBPNzOnI1TwbWCcvZ8nGhxw";

const firebaseConfig = {
  apiKey: "AIzaSyBAq4mLJ5BEop8-73fIO8raChnVoKvPo68",
  authDomain: "motivator-dcb76.firebaseapp.com",
  projectId: "motivator-dcb76",
  storageBucket: "motivator-dcb76.appspot.com",
  messagingSenderId: "672217224954",
  appId: "1:672217224954:web:34681a2f4a08f411fb1b43"
};

const firebase = initializeApp(firebaseConfig);
const messaging = getMessaging(firebase);

console.log(self);

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();
    if (event.action === "watch_details") {
      // User selected the Archive action.
      console.log('Notification "watch_details" processing');
    } else if (event.action === "close") {
      console.log('Notification "watch_details" processing. Do nothing.');
    } else {
      // User selected (e.g., clicked in) the main body of notification.
      console.log('Notification action not found');
    }
  },
  false,
);

onBackgroundMessage(messaging, async (payload) => {
  console.log('[EXTENSION firebase-messaging-sw.js] Received background message ', payload);
  const storedUserId = (await chrome.storage.local.get([StorageKeys.LOGGED_USER_ID]))[StorageKeys.LOGGED_USER_ID];

  if (null === storedUserId
    || null === (payload?.data?.userId ?? null)
    || storedUserId !== payload?.data?.userId
  ) {
    console.log('EXTENSION got message for not logged in user.');

    return;
  }

  // Customize notification here
  let title = payload?.data?.title ?? null;
  const body = payload?.data?.body ?? null;
  const doneAt = payload?.data?.doneAt ?? '';
  const requireInteraction = payload?.data?.requireInteraction ?? 'true';

  if (null === title
    || null === body
  ) {
    return;
  }

  const actions: NotificationAction[] = [
    {
      action: 'watch_details',
      title: 'Details',
    },
    {
      action: 'close',
      title: 'Close',
    }
  ];

  const options: NotificationOptions = {
    body: body,
    requireInteraction: requireInteraction === 'true',
    silent: true,
    icon: payload?.data?.icon ?? 'assets/icons/logo.png',
    actions: actions,
  };

  if ('' !== doneAt) {
    const time = new DateW3c(doneAt);
    title += ' ' + time.toUserView();
  }

  await self.registration.showNotification(title, options);

  chrome.notifications.getAll((notification) => {
    console.log(notification);
  });
});

const refreshFcmToken = async () => {
  let token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: self.registration, // note: we use the sw of ourself to register with
  });

  if (token) {
    console.log(`fcm device token received: ${token}`);
    token = btoa(token);
    console.log(`fcm device token encoded: ${token}`);

    const request = new FcmTokenRegister(token);
    await request.send();
  } else {
    console.log(`fcm device token not received`);
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === 'authentication_email_password') {
    const email = request.payload.email;
    const password = request.payload.password;
    const apiRequest = new LoginRequest(email, password);

    await apiRequest.send();

    const storedAccessToken = (await chrome.storage.local.get([StorageKeys.ACCESS_TOKEN]))[StorageKeys.ACCESS_TOKEN];
    const storedRefreshToken = (await chrome.storage.local.get([StorageKeys.REFRESH_TOKEN]))[StorageKeys.REFRESH_TOKEN];
    const storedUserId = (await chrome.storage.local.get([StorageKeys.LOGGED_USER_ID]))[StorageKeys.LOGGED_USER_ID];
    const storedFcmTokenExpireAt = (await chrome.storage.local.get([StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC]))[StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC];

    console.log({storedAccessToken, storedRefreshToken, storedUserId, storedFcmTokenExpireAt});

    await refreshFcmToken();

    await chrome.action.setPopup({popup: './signout.html'});

    sendResponse({status: 200});
  } else if (request.message === 'authentication_signout') {
    const apiRequest = new LogoutRequest();

    try {
      await apiRequest.send();
    } catch (e) {
      console.log(e);
      await chrome.storage.local.remove([
        StorageKeys.LOGGED_USER_ID,
        StorageKeys.ACCESS_TOKEN,
        StorageKeys.REFRESH_TOKEN,
        StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC,
      ]);
    }

    const storedAccessToken = (await chrome.storage.local.get([StorageKeys.ACCESS_TOKEN]))[StorageKeys.ACCESS_TOKEN];
    const storedRefreshToken = (await chrome.storage.local.get([StorageKeys.REFRESH_TOKEN]))[StorageKeys.REFRESH_TOKEN];
    const storedUserId = (await chrome.storage.local.get([StorageKeys.LOGGED_USER_ID]))[StorageKeys.LOGGED_USER_ID];
    const storedFcmTokenExpireAt = (await chrome.storage.local.get([StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC]))[StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC];

    console.log({storedAccessToken, storedRefreshToken, storedUserId, storedFcmTokenExpireAt});

    await chrome.action.setPopup({popup: './signin.html'});

    sendResponse({status: 200});
  }

  return true;
});
