import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw} from 'lucide-react-native';

import {resetPassword} from '../../api/auth';
import type {AuthStackParamList} from '../../navigation/AuthStackParamList';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = ({navigation, route}: Props) => {
  const token = route.params?.token?.trim() || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTokenError, setIsTokenError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleBackToLogin = () => {
    Keyboard.dismiss();
    setSuccessMessage('');
    setError('');
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setError('');
    setIsTokenError(false);

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new password reset link.');
      setIsTokenError(true);
      return;
    }

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        token,
        newPassword,
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Your password has been reset successfully.');
      } else {
        const errorMsg = response.message || 'Unable to reset password. Please try again.';
        setError(errorMsg);
        if (
          errorMsg.toLowerCase().includes('token') ||
          errorMsg.toLowerCase().includes('expired') ||
          errorMsg.toLowerCase().includes('invalid')
        ) {
          setIsTokenError(true);
        }
      }
    } catch (err: unknown) {
      const axiosError = err as {response?: {data?: {message?: string}}};
      const message = axiosError?.response?.data?.message || 'Unable to connect to the server. Please try again.';

      if (
        message.toLowerCase().includes('token') ||
        message.toLowerCase().includes('expired') ||
        message.toLowerCase().includes('invalid')
      ) {
        setError('This password reset link is invalid or has expired. Please request a new password reset link.');
        setIsTokenError(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
            <View style={styles.warningIconContainer}>
              <AlertCircle size={32} color="#DC2626" />
            </View>

            <Text style={styles.heading}>Invalid Reset Link</Text>
            <Text style={styles.description}>
              This password reset link is invalid or missing a valid token. Please request a new password reset link.
            </Text>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ForgotPassword')}
              accessibilityLabel="Request New Reset Link"
              accessibilityRole="button">
              <RefreshCw size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>Request New Reset Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              activeOpacity={0.7}
              onPress={handleBackToLogin}
              accessibilityLabel="Back to Login"
              accessibilityRole="button">
              <ArrowLeft size={16} color="#6C4CE8" />
              <Text style={styles.backLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Dolphin360Suite Enterprise</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (successMessage) {
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
          </View>

          <View style={styles.card}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={32} color="#10B981" />
              </View>
            </View>

            <Text style={styles.heading}>Password Reset Successful</Text>
            <Text style={styles.description}>{successMessage}</Text>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={handleBackToLogin}
              accessibilityLabel="Back to Login"
              accessibilityRole="button">
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Dolphin360Suite Enterprise</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
          <Text style={styles.heading}>Set New Password</Text>
          <Text style={styles.description}>
            Create a secure password for your CRM account.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={18} color="#64748B" />
              </View>
              <TextInput
                value={newPassword}
                onChangeText={text => {
                  setNewPassword(text);
                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={[styles.input, loading && styles.inputDisabled]}
                accessibilityLabel="Enter new password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                activeOpacity={0.7}
                onPress={() => setShowNewPassword(prev => !prev)}
                accessibilityLabel={showNewPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button">
                {showNewPassword ? (
                  <EyeOff size={18} color="#64748B" />
                ) : (
                  <Eye size={18} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={18} color="#64748B" />
              </View>
              <TextInput
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Confirm new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={[styles.input, loading && styles.inputDisabled]}
                accessibilityLabel="Confirm new password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                activeOpacity={0.7}
                onPress={() => setShowConfirmPassword(prev => !prev)}
                accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button">
                {showConfirmPassword ? (
                  <EyeOff size={18} color="#64748B" />
                ) : (
                  <Eye size={18} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={handleResetPassword}
            disabled={loading}
            accessibilityLabel="Reset password"
            accessibilityRole="button">
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Update CRM Password</Text>
            )}
          </TouchableOpacity>

          {isTokenError ? (
            <TouchableOpacity
              style={styles.buttonSecondary}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={loading}
              accessibilityLabel="Request New Reset Link"
              accessibilityRole="button">
              <RefreshCw size={15} color="#6C4CE8" />
              <Text style={styles.buttonSecondaryText}>Request New Reset Link</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.backLink}
            activeOpacity={0.7}
            onPress={handleBackToLogin}
            disabled={loading}
            accessibilityLabel="Back to login"
            accessibilityRole="button">
            <ArrowLeft size={16} color="#6C4CE8" />
            <Text style={styles.backLinkText}>Back to Login</Text>
          </TouchableOpacity>
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
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#6C4CE8',
    marginTop: 6,
    shadowColor: '#6C4CE8',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
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
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F3F0FF',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  buttonSecondaryText: {
    color: '#6C4CE8',
    fontSize: 14,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },

  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C4CE8',
  },
  footer: {
    textAlign: 'center',
    marginTop: 28,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default ResetPasswordScreen;
