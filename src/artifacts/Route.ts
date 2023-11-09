type TRoutes = {
  host: string;
  register: string;
  login: string;
  logout: string;
  refreshAccessToken: string;
  profile: string;
  fcmTokenRegister: string;
  fcmTokenProlong: string;
  analyticsTrackNotification: string;
}

export const Routes: TRoutes = {
  host: "https://achievernotifier.com/api/v1",
  register: "/auth/register",
  login: "/auth/login",
  logout: "/auth/logout/web_ext",
  refreshAccessToken: "/auth/token/refresh",
  profile: "/profile",
  fcmTokenRegister: "/firebase/store/token/{{token}}/web_ext",
  fcmTokenProlong: "/firebase/prolong/token/web_ext",
  analyticsTrackNotification: "/analytics/track/notification",
}
