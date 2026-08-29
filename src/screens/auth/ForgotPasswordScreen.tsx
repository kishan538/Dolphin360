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
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Mail, AlertCircle, ArrowLeft, CheckCircle2} from 'lucide-react-native';

import {forgotPassword} from '../../api/auth';
import type {AuthStackParamList} from '../../navigation/AuthStackParamList';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const ForgotPasswordScreen = ({navigation}: Props) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSend = async () => {
    Keyboard.dismiss();
    setError('');

    const trimmed = email.trim();

    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(trimmed);

      if (response.success) {
        setSuccessMessage(response.message || 'If an account exists with this email, you will receive a password reset link.');
      } else {
        setError(
          response.message || 'Something went wrong. Please try again.',
        );
      }
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

  const handleBackToLogin = () => {
    Keyboard.dismiss();
    setSuccessMessage('');
    setEmail('');
    setError('');
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

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

            <Text style={styles.heading}>Check your email</Text>

            <Text style={styles.description}>{successMessage}</Text>

            <View style={styles.submittedEmailBox}>
              <Text style={styles.sentToLabel}>Email submitted:</Text>
              <Text style={styles.sentToEmail}>{email.trim()}</Text>
            </View>

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
          <Text style={styles.heading}>Forgot Password?</Text>
          <Text style={styles.description}>
            Enter your registered email address and we'll send you instructions to reset your password.
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
                }}
                placeholder="name@company.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="send"
                onSubmitEditing={handleSend}
                editable={!loading}
                style={[styles.input, loading && styles.inputDisabled]}
                accessibilityLabel="Work email address input"
              />
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
            onPress={handleSend}
            disabled={loading}
            accessibilityLabel="Send Reset Link"
            accessibilityRole="button">
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Instructions</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            activeOpacity={0.7}
            onPress={handleBackToLogin}
            disabled={loading}
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
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submittedEmailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sentToLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '500',
  },
  sentToEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
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

  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
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

export default ForgotPasswordScreen;
