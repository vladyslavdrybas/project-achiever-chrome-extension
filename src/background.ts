import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"; // note: we MUST use the sw version of the messaging API and NOT the one from "firebase/messaging"
import { getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";

const vapidKey = "BG9ZzgwoZHtOmt7g2VBIQJHASK9VEAup7q7IS2q0XRCM6L75_ahO2kFW8zPwBRjqfBPNzOnI1TwbWCcvZ8nGhxw";
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
  const token = await getToken(getMessaging(), {
    serviceWorkerRegistration: self.registration, // note: we use the sw of ourself to register with
  });
  // Now pass this token to your server and use it to send push notifications to this user
}

const onEnabledHandler = async () => {
  requestToken();
}

chrome.management.onEnabled.addListener(onEnabledHandler);

chrome.notifications.getAll(notifications => {
  for (let note in notifications) {
    console.log(note);
  }
});
//
// onBackgroundMessage(getMessaging(firebase), async (payload) => {
//   console.log(`Huzzah! A Message. onBackgroundMessage`, payload);
//   const noteTitle = payload?.notification?.title ?? 'Achievement Done';
//   const noteRequireInteraction = (payload?.data?.requireInteraction === 'true') ?? true;
//   const noteOptions = {
//     body: payload?.notification?.body,
//     requireInteraction: noteRequireInteraction,
//   };
//
//   let notification = new Notification(noteTitle, noteOptions);
//
//   notification.onclick = function(event) {
//     event.preventDefault();
//     // if(typeof payload.notification.click_action != 'undefined' && payload.notification.click_action != '')
//     //   window.open(payload.notification.click_action,'_blank');
//     notification.close();
//   }
//
//   // Note: you will need to open a notification here or the browser will do it for you.. something, something, security
// });
//
// onMessage(getMessaging(firebase), async (payload) => {
//   console.log(`Huzzah! A Message. onMessage`, payload);
//   const noteTitle = payload?.notification?.title ?? 'Achievement Done';
//   const noteRequireInteraction = (payload?.data?.requireInteraction === 'true') ?? true;
//   const noteOptions = {
//     body: payload?.notification?.body,
//     requireInteraction: noteRequireInteraction,
//   };
//
//   let notification = new Notification(noteTitle, noteOptions);
//
//   notification.onclick = function(event) {
//     event.preventDefault();
//     // if(typeof payload.notification.click_action != 'undefined' && payload.notification.click_action != '')
//     //   window.open(payload.notification.click_action,'_blank');
//     notification.close();
//   }
//
//   // Note: you will need to open a notification here or the browser will do it for you.. something, something, security
// });
