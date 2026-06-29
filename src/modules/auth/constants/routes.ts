export const AUTH_ROUTES = {
  signIn: "/signin",
  signUp: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/",
  cabinet: "/cabinet",
} as const;

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.signIn,
  AUTH_ROUTES.signUp,
  AUTH_ROUTES.forgotPassword,
  AUTH_ROUTES.resetPassword,
] as const;

export const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "current-user"] as const,
};
