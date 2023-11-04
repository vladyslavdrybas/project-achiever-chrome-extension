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
  host: "https://c68b-195-3-128-16.ngrok-free.app",
  register: "/api/auth/register",
  login: "/api/auth/login",
  logout: "/api/auth/logout/web_ext",
  refreshAccessToken: "/api/auth/token/refresh",
  profile: "/api/profile",
  fcmTokenRegister: "/api/firebase/store/token/{{token}}/web_ext",
  fcmTokenProlong: "/api/firebase/prolong/token/web_ext",
  analyticsTrackNotification: "/api/analytics/track/notification",
}
