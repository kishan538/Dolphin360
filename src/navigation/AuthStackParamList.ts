export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: {token?: string} | undefined;
};
