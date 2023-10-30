type TRoutes = {
  host: string;
  register: string;
  login: string;
  logout: string;
  refreshAccessToken: string;
  profile: string;
  fcmTokenRegister: string;
}

export const Routes: TRoutes = {
  host: "https://8bab-89-209-64-155.ngrok-free.app",
  register: "/api/auth/register",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  refreshAccessToken: "/api/auth/token/refresh",
  profile: "/api/profile",
  fcmTokenRegister: "/api/firebase/store/token/{{token}}/web_ext",
}
