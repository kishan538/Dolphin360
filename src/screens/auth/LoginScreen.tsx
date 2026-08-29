import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2} from 'lucide-react-native';

import {login as loginApi, resendVerificationEmail} from '../../api/auth';
import {useAuth} from '../../context/AuthContext';
import type {AuthStackParamList} from '../../navigation/AuthStackParamList';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const LoginScreen = ({navigation}: Props) => {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError('');
    setResendSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      const response = await loginApi({
        email: trimmedEmail,
        password,
      });

      if (!response.success) {
        setError(response.message || 'Login failed.');
        return;
      }

      const responseData = response.data as Record<string, unknown>;
      const token =
        (responseData.token as string) ||
        (responseData.accessToken as string) ||
        '';
      const refreshToken = (responseData.refreshToken as string) || undefined;

      await login(response.data.user, token, refreshToken);
    } catch (err: unknown) {
      const axiosError = err as {response?: {data?: {message?: string}}};
      const message =
        axiosError?.response?.data?.message ||
        'Unable to connect to the server. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    Keyboard.dismiss();
    setError('');
    setResendSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your work email to resend verification link.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (resendLoading || cooldown > 0) {
      return;
    }

    try {
      setResendLoading(true);

      const response = await resendVerificationEmail({
        email: trimmedEmail,
      });

      if (response.success) {
        setResendSuccess(
          response.message || 'Verification email sent successfully.',
        );
        setCooldown(30);
      } else {
        setError(
          response.message || 'Unable to send verification email. Please try again.',
        );
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
      };

      const message =
        axiosError?.response?.data?.message ||
        'Unable to send verification email. Please try again.';
      setError(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always">
        <View style={styles.brandSection}>
          <Image
            source={require('../../assets/images/dolphin360-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Dolphin360Suite logo"
          />
          <Text style={styles.subtitle}>
            Enterprise CRM & Business Operations
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.description}>
            Sign in to access your CRM workspace
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Work Email</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail size={18} color="#64748B" />
              </View>
              <TextInput
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (error) {
                    setError('');
                  }
                  if (resendSuccess) {
                    setResendSuccess('');
                  }
                }}
                placeholder="name@company.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading && !resendLoading}
                style={[styles.input, (loading || resendLoading) && styles.inputDisabled]}
                accessibilityLabel="Work email input"
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Password</Text>
              <Pressable
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={loading || resendLoading}
                accessibilityLabel="Forgot Password"
                accessibilityRole="button">
                <Text style={styles.forgotInlineText}>Forgot password?</Text>
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={18} color="#64748B" />
              </View>
              <TextInput
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                editable={!loading && !resendLoading}
                style={[styles.input, (loading || resendLoading) && styles.inputDisabled]}
                accessibilityLabel="Password input"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(prev => !prev)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button">
                {showPassword ? (
                  <EyeOff size={18} color="#64748B" />
                ) : (
                  <Eye size={18} color="#64748B" />
                )}
              </Pressable>
            </View>
          </View>

          {resendSuccess ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.successText}>{resendSuccess}</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={({pressed}) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading || resendLoading}
            accessibilityLabel="Sign in button"
            accessibilityRole="button">
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In to Dashboard</Text>
            )}
          </Pressable>

          <View style={styles.resendContainer}>
            <Text style={styles.resendPrompt}>Didn't receive verification email?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResendVerification}
              disabled={resendLoading || cooldown > 0 || loading}
              accessibilityLabel="Resend verification email"
              accessibilityRole="button">
              {resendLoading ? (
                <ActivityIndicator size="small" color="#6C4CE8" />
              ) : (
                <Text
                  style={[
                    styles.resendLink,
                    (cooldown > 0 || loading) && styles.resendLinkDisabled,
                  ]}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>Dolphin360Suite Enterprise</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  description: {
    marginTop: 4,
    marginBottom: 24,
    fontSize: 14,
    color: '#64748B',
  },
  field: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  forgotInlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C4CE8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FAFBFC',
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  successText: {
    flex: 1,
    color: '#059669',
    fontSize: 13,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#6C4CE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{scale: 0.99}],
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  resendPrompt: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C4CE8',
  },
  resendLinkDisabled: {
    opacity: 0.6,
  },
  footer: {
    textAlign: 'center',
    marginTop: 28,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default LoginScreen;