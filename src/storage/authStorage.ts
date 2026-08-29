import * as Keychain from 'react-native-keychain';
import type {User} from '../types';

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export const saveAuthSession = async (
  session: AuthSession,
): Promise<void> => {
  try {
    const payload = JSON.stringify({
      user: session.user,
      refreshToken: session.refreshToken || '',
    });

    await Keychain.setGenericPassword(payload, session.accessToken);
  } catch {
    return;
  }
};

export const getAuthSession = async (): Promise<AuthSession | null> => {
  try {
    const credentials = await Keychain.getGenericPassword();

    if (!credentials || !credentials.password) {
      return null;
    }

    const accessToken = credentials.password;
    let user: User | null = null;
    let refreshToken: string | undefined;

    try {
      const parsed = JSON.parse(credentials.username);
      if (parsed && typeof parsed === 'object') {
        if ('user' in parsed && parsed.user) {
          user = parsed.user as User;
          refreshToken = parsed.refreshToken ? String(parsed.refreshToken) : undefined;
        } else if ('id' in parsed && 'email' in parsed) {
          user = parsed as User;
        }
      }
    } catch {
      return null;
    }

    if (!user) {
      return null;
    }

    return {user, accessToken, refreshToken};
  } catch {
    return null;
  }
};

export const clearAuthSession = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword();
  } catch {
    return;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const session = await getAuthSession();
    return session?.accessToken || null;
  } catch {
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const session = await getAuthSession();
    return session?.refreshToken || null;
  } catch {
    return null;
  }
};

export const clearAuthToken = async (): Promise<void> => {
  await clearAuthSession();
};