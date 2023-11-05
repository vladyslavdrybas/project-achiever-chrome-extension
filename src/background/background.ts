import browser from 'webextension-polyfill'
import LoginRequest from "@/api/requests/LoginRequest";
import LocalStorage from "@/util/LocalStorage";
import Fcm from "@/util/Fcm";
import FcmTokenRegister from "@/api/requests/FcmTokenRegister";
import LogoutRequest from "@/api/requests/LogoutRequest";
import DateW3c from "@/util/DateW3c";
import AnalyticsTrackNotificationRequest from "@/api/requests/AnalyticsTrackNotificationRequest";

type Message = {
    from: string;
    to: string;
    action: string;
    payload: any;
}

type ResponseMessage = {
    status: number;
    message: string;
}

const ResponseSuccess: ResponseMessage = {
    status: 200,
    message: 'success',
}

/* eslint-disable-next-line no-restricted-globals */
const serviceWorker = self;

const fcm = new Fcm(serviceWorker);


const openDetailsLink = (link: string|null) => {
    if (link) {
        chrome.tabs.create({ url: link });
    }
}

const sendAnalytics = (event: Event) => {
    const notification = event?.notification ?? null;
    if (!notification) {
        return;
    }

    console.log('sendAnalytics', notification);

    let data = notification?.data ?? null;
    if (null === data) {
        data = {};
    }
    data['title'] = notification.title;
    data['body'] = notification.body;
    data['timestamp'] = notification.timestamp;
    data['closedAt'] = (new DateW3c()).getTime();
    if (data?.icon) {
        data['icon'] = data.icon;
    }
    if (data?.doneAt) {
        data['doneAt'] = data.doneAt;
    }
    if (data?.link) {
        data['link'] = data.link;
    }
    if (data?.closeOnAction) {
        data['closeOnAction'] = data.closeOnAction;
    }
    if (data?.lang) {
        data['lang'] = data.lang;
    }

    const apiRequest = new AnalyticsTrackNotificationRequest(data);

    apiRequest.send();
}

const refreshFcmToken = async () => {
    let token = await fcm.registerToken();

    if (null === token) {
        throw new Error('Cannot register fcm token. Try later.');
    }

    console.log(`fcm device token received: ${token}`);
    token = btoa(token);
    console.log(`fcm device token encoded: ${token}`);

    const request = new FcmTokenRegister(token);
    await request.send();
}

const sendLoginRequest = async (email: string, password: string) => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
        throw new Error('Invalid email');
    }

    if (password.length < 5) {
        throw new Error('Password is less than 5. ');
    }

    try {
        const apiRequest = new LoginRequest(email, password);
        await apiRequest.send();
        await refreshFcmToken();
        await (new LocalStorage()).log();
    } catch (e: any) {
        console.log(e);
        return {
            status: 400,
            message: e.message,
        };
    }

    return ResponseSuccess;
}

const sendLogoutRequest = async () => {
    const apiRequest = new LogoutRequest();

    try {
        await apiRequest.send();
    } catch (e: any) {
        console.log(e);
        await (new LocalStorage()).log();

        // return {
        //     status: 400,
        //     message: e.message,
        // };
    }

    return ResponseSuccess;
}

const showNotificationFromPayload = async (payload: any) => {
    console.log('[EXTENSION firebase-messaging-sw.js] Received background message ', payload);
    if (!payload) {
        console.log('Corrupted payload');
        return;
    }
    const storedUserId = await (new LocalStorage()).getLoggedUserId();

    if (null === storedUserId
        || null === (payload.data?.userId ?? null)
        || storedUserId !== payload.data?.userId
    ) {
        console.log('EXTENSION got message for not logged in user.');

        return;
    }

    let title = payload.data?.title ?? null;
    const body = payload.data?.body ?? null;

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

    let doneAt = payload.data?.doneAt ?? null;
    if (doneAt) {
        doneAt = (new DateW3c(doneAt)).toUserView();
        title += ' ' + doneAt;
    }

    const requireInteraction = payload.data?.requireInteraction ?? 'true';
    const link = payload.data?.link ?? null;
    const options: NotificationOptions = {
        body: body,
        requireInteraction: requireInteraction === 'true',
        silent: true,
        actions: actions,
        data: {
            link,
            doneAt,
            storedUserId,
        },
    };

    const icon = payload.data?.icon ?? null;
    if (icon) {
        options['icon'] = icon;
    }

    if (payload.fcmMessageId) {
        options.data['fcmMessageId'] = payload.fcmMessageId;
    }

    if (payload.from) {
        options.data['from'] = payload.from;
    }

    if (payload.priority) {
        options.data['priority'] = payload.priority;
    }

    if (payload.messageToken) {
        options.data['messageToken'] = payload.messageToken;
    }

    if (payload.achievementId) {
        options.data['achievementId'] = payload.achievementId;
    }

    options.data['userId'] = payload.userId;

    console.log([
        'show notification with options:',
        options,
    ])

    await serviceWorker.registration.showNotification(title, options);
}

// @ts-ignore
browser.runtime.onMessage.addListener((message: Message, sender, sendResponse): any => {
    console.log('on message listener');
    console.log(message);

    if (message.to === 'background' && message.action === 'authentication_email_password') {
        console.log(message);
        const email = message.payload.email;
        const password = message.payload.password;

        sendLoginRequest(email, password).then(
            r =>
            {
                console.log([
                    'login success request',
                    r
                ])
                // @ts-ignore
                sendResponse(r)

                return r;
            }
        ).catch(
            r => {
                console.log([
                    'login fail request',
                    r
                ])
                // @ts-ignore
                sendResponse({
                    status: 400,
                    message: r.message
                })
            }
        );
    } else if (message.to === 'background' && message.action === 'authentication_out') {
        console.log(message);

        sendLogoutRequest().then(
            r =>
            {
                console.log([
                    'logout success request',
                    r
                ])
                // @ts-ignore
                sendResponse(r)

                return r;
            }
        ).catch(
            r => {
                console.log([
                    'logout fail request',
                    r
                ])
                // @ts-ignore
                sendResponse({
                    status: 400,
                    message: r.message
                })
            }
        );
    } else {
        // @ts-ignore
        sendResponse({
            status: 200,
            message: "Undefined action",
        });
    }

    return true;
});

browser.management.onEnabled.addListener(() => {
    sendLogoutRequest().then(r => {console.log(r); return r;}).catch(e => console.log(e));
});

browser.management.onDisabled.addListener(() => {
    sendLogoutRequest().then(r => {console.log(r); return r;}).catch(e => console.log(e));
});

browser.management.onUninstalled.addListener(() => {
    sendLogoutRequest().then(r => {console.log(r); return r;}).catch(e => console.log(e));
});

serviceWorker.addEventListener("push", (event) => {
        let payload = event.data.json();
        console.log(`Message on push notification`, payload);

        showNotificationFromPayload(payload).catch(e => console.log(e.message));
    },
    false
);

serviceWorker.addEventListener("notificationclick", (event) => {
    console.log('notificationclick');
    console.log(event);
    const notification = event?.notification ?? null;
    if (!notification) return;
        sendAnalytics(event);
        const payload = notification?.data ?? null;

        console.log('notification click event. notification', event.notification);
        notification.data['closeOnAction'] = event.action;

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
                if (!notification.data.closeOnAction) {
                    notification.data.closeOnAction = 'unknown';
                }
                console.log('Notification action default');
                const closeDuration = payload?.duration ?? 3000;
                setTimeout(() => {
                    notification.close();
                }, closeDuration);
        }
  },
  false
);

serviceWorker.addEventListener("notificationclose", (event): void => {
    console.log('notificationclose');
    console.log(event);
    if (!event.notification) {
        return;
    }
    console.log('notification close event. notification', event.notification);
    if (event.notification.data) {
        event.notification.data['closeOnAction'] = 'close_x_click';
    }
    sendAnalytics(event);
},
    false
);
