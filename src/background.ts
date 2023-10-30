import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"; // note: we MUST use the sw version of the messaging API and NOT the one from "firebase/messaging"
import { getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { StorageKeys } from "./types/StorageKeys";
import LoginRequest from "./api/requests/LoginRequest";
import FcmTokenRegister from "./api/requests/FcmTokenRegister";

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

onBackgroundMessage(messaging, (payload) => {
  console.log('[EXTENSION firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const title = payload?.data?.title ?? null;
  const body = payload?.data?.body ?? null;
  const requireInteraction = payload?.data?.requireInteraction ?? 'true';

  if (null === title
    || null === body
  ) {
    return;
  }

  const notificationTitle = title;
  const notificationOptions = {
    body: body,
    requireInteraction: requireInteraction,
  };

  self.registration.showNotification(notificationTitle,notificationOptions);
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
  if (request.message === 'email_password_authentication') {
    const email = request.payload.email;
    const password = request.payload.password;
    const apiRequest = new LoginRequest(email, password);

    await apiRequest.send();

    const storedAccessToken = (await chrome.storage.local.get([StorageKeys.ACCESS_TOKEN]))[StorageKeys.ACCESS_TOKEN];
    const storedRefreshToken = (await chrome.storage.local.get([StorageKeys.REFRESH_TOKEN]))[StorageKeys.REFRESH_TOKEN];
    const storedUserId = (await chrome.storage.local.get([StorageKeys.LOGGED_USER_ID]))[StorageKeys.LOGGED_USER_ID];

    console.log({storedAccessToken, storedRefreshToken, storedUserId});

    await refreshFcmToken();
  }

  return true;
});
