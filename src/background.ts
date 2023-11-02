import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"; // note: we MUST use the sw version of the messaging API and NOT the one from "firebase/messaging"
import { getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { StorageKeys } from "./types/StorageKeys";
import LoginRequest from "./api/requests/LoginRequest";
import FcmTokenRegister from "./api/requests/FcmTokenRegister";
import LogoutRequest from "./api/requests/LogoutRequest";
import DateW3c from "./util/DateW3c";
import AnalyticsTrackNotificationRequest from "./api/requests/AnalyticsTrackNotificationRequest";

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

const logStorageData = async () => {
  const storedAccessToken = (await chrome.storage.local.get([StorageKeys.ACCESS_TOKEN]))[StorageKeys.ACCESS_TOKEN];
  const storedRefreshToken = (await chrome.storage.local.get([StorageKeys.REFRESH_TOKEN]))[StorageKeys.REFRESH_TOKEN];
  const storedUserId = (await chrome.storage.local.get([StorageKeys.LOGGED_USER_ID]))[StorageKeys.LOGGED_USER_ID];
  const storedFcmTokenExpireAt = (await chrome.storage.local.get([StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC]))[StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC];

  console.log({
    storedAccessToken,
    storedRefreshToken,
    storedUserId,
    storedFcmTokenExpireAt
  });
}

const cleanStorageData = async () => {
  await chrome.storage.local.remove([
    StorageKeys.LOGGED_USER_ID,
    StorageKeys.ACCESS_TOKEN,
    StorageKeys.REFRESH_TOKEN,
    StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC,
  ]);

  await logStorageData();
}

const openDetailsLink = (link: string|null) => {
  if (link) {
    chrome.tabs.create({ url: link });
  }
}

const saveAnalytics = (event: Event) => {
  const notification = event?.notification ?? null;
  if (!notification) {
    return;
  }

  const payload = notification?.data ?? null;

  const data = payload;
  payload['icon'] = notification.icon;
  payload['title'] = notification.title;
  payload['body'] = notification.body;
  payload['timestamp'] = notification.timestamp;
  payload['closedAt'] = (new DateW3c()).getTime();
  if (payload) {
    payload['requireInteraction'] = payload.requireInteraction ?? null;
    payload['silent'] = payload.silent ?? null;
    payload['lang'] = payload.lang ?? null;
    payload['doneAt'] = payload.doneAt ?? null;
    payload['link'] = payload.link ?? null;
    payload['closeOnAction'] = payload.closeOnAction ?? null;
  }

  const apiRequest = new AnalyticsTrackNotificationRequest(data);

  apiRequest.send();
}

self.addEventListener(
  "notificationclick",
  (event) => {
    console.log('notificationclick');
    console.log(event);
    const notification = event?.notification ?? null;
    const payload = notification?.data ?? null;
    notification.data.closeOnAction = event.action;
    switch (event.action) {
      case "watch_details":
        console.log('Notification "watch_details" processing');
        openDetailsLink(payload?.link ?? null);
        event.notification.close();
        break;
      case "close":
        console.log('Notification "close" processing');
        event.notification.close();
        break;
      default:
        console.log('Notification action default');
        setTimeout(() => {
          notification.close();
        }, 5000);
    }
    saveAnalytics(event);
  },
  false,
);

self.addEventListener("notificationclose", (event): void => {
  //TODO add sync api request to store activity
  console.log('notificationclose');
  console.log(event);
  if (!event.notification) {
    return;
  }
  event.notification.data.closeOnAction = 'close_cross';
  saveAnalytics(event);
});

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

  let title = payload?.data?.title ?? null;
  const body = payload?.data?.body ?? null;

  if (null === title || null === body) {
    return;
  }

  // Customize notification here
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

  let doneAt = payload?.data?.doneAt ?? null;
  if (doneAt) {
    doneAt = (new DateW3c(doneAt)).toUserView();
    title += ' ' + doneAt;
  }

  const requireInteraction = payload?.data?.requireInteraction ?? 'true';
  const link = payload.data?.link ?? null;
  const options: NotificationOptions = {
    body: body,
    requireInteraction: requireInteraction === 'true',
    silent: true,
    actions: actions,
    data: {
      link,
      doneAt,
    },
  };

  const icon = payload?.data?.icon ?? payload?.data?.image ?? null;
  if (icon) {
    options['icon'] = icon;
  }

  await self.registration.showNotification(title, options);
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

const sendLoginRequest = async (email: string, password: string) => {
  const apiRequest = new LoginRequest(email, password);

  try {
    await apiRequest.send();
  } catch (e) {
    console.log(e);
    return 400;
  }

  await logStorageData();
  await refreshFcmToken();

  await chrome.action.setPopup({popup: './signout.html'});

  return 200;
}

const sendLogoutRequest = async () => {
  const apiRequest = new LogoutRequest();

  try {
    await apiRequest.send();
    await logStorageData();
  } catch (e) {
    console.log(e);
    await cleanStorageData();
  }

  await chrome.action.setPopup({popup: './signin.html'});

  return 200;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'authentication_email_password') {
    const email = request.payload.email;
    const password = request.payload.password;
    sendLoginRequest(email, password).then(r =>
      sendResponse({status: r})
    );
  } else if (request.message === 'authentication_signout') {
    sendLogoutRequest().then(r =>
      sendResponse({status: r})
    );
  }

  return true;
});
