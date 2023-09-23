import { KindeSDK } from '@kinde-oss/react-native-sdk-0-7x'

export const kindeClient = new KindeSDK(
  process.env.KINDE_ISSUER_URL || '',
  process.env.KINDE_NATIVE_POST_CALLBACK_URL || '',
  process.env.KINDE_CLIENT_ID || '',
  process.env.KINDE_NATIVE_POST_LOGOUT_REDIRECT_URL || '',
)