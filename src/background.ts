import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"; // note: we MUST use the sw version of the messaging API and NOT the one from "firebase/messaging"
import { getToken, isSupported } from "firebase/messaging";
import { initializeApp } from "firebase/app";

const NEXT_PUBLIC_HOST_ROUTE="https://8bab-89-209-64-155.ngrok-free.app/api/firebase/fake/store/token/{{token}}/web_ext/{{user}}"
const USER_ID= '5440a081-1e50-41e8-8d62-4e06fc51a69c';
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

const requestToken = async () => {
  let token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: self.registration, // note: we use the sw of ourself to register with
  });

  if (token) {
    token = btoa(token);
    let route = NEXT_PUBLIC_HOST_ROUTE.replace('{{token}}', token);
    route = route.replace('{{user}}', USER_ID);
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "ngrok-skip-browser-warning": "69420",
    }
    const init: any = {
      method: "GET",
      headers: headers,
    };
    console.log({
      source: 'extension',
      requestRoute: route,
      requestMethod: init.method,
      requestHeaders: init.headers,
    });
    const response = await fetch(route, init);
    console.log({
      source: 'extension',
      response: await response.json(),
    });
  }
  console.log(`fcm device token received: ${token}`);
  // Now pass this token to your server and use it to send push notifications to this user
}

const onEnabledHandler = async () => {
  console.log("enable extension");
  requestToken();
}

chrome.management.onEnabled.addListener(onEnabledHandler);

onBackgroundMessage(messaging, (payload) => {
  console.log('[EXTENSION firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload?.data?.title ?? 'Background Message Title';
  const notificationOptions = {
    body: payload?.data?.body,
    requireInteraction: payload?.data?.requireInteraction,
  };

  self.registration.showNotification(notificationTitle,notificationOptions);
});
