import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"; // note: we MUST use the sw version of the messaging API and NOT the one from "firebase/messaging"
import { getToken, Messaging } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import {options, vapidKey} from '@/artifacts/FcmConstants';

class Fcm {
    _messaging: Messaging;
    _globalThis: any;

    constructor(globalThis: any) {
        const firebase = initializeApp(options);
        this._messaging = getMessaging(firebase);
        this._globalThis = globalThis;
    }

    get messaging(): Messaging
    {
        return this._messaging;
    }

    registerToken = async (): Promise<string|null> => {
        let token = await getToken(this.messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: this._globalThis.registration, // note: we use the sw of ourself to register with
        });

        if (token) {
            // console.log(`fcm device token received: ${token}`);
            // token = btoa(token);
            // console.log(`fcm device token encoded: ${token}`);
            //
            // const request = new FcmTokenRegister(token);
            // await request.send();

            return token;
        }

        return null;
    }
}

export default Fcm;