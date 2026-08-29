import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lock, KeyRound, Eye, EyeOff, AlertCircle, ArrowLeft} from 'lucide-react-native';
import {changePassword} from '../../api/auth';
import {getAuthToken} from '../../storage/authStorage';
import {useAuth} from '../../context/AuthContext';

const COLORS = {
  primary: '#6C4CE8',
  background: '#F8F9FD',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  error: '#DC2626',
};

interface ChangePasswordScreenProps {
  onGoBack: () => void;
}

const ChangePasswordScreen = ({onGoBack}: ChangePasswordScreenProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const {logout} = useAuth();

  useEffect(() => {
    const onBackPress = () => {
      onGoBack();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [onGoBack]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
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
      const token = await getAuthToken();

      if (!token) {
        setError('Session expired. Please log in again.');
        return;
      }

      const response = await changePassword(
        {currentPassword, newPassword},
        token,
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert(
        'Password Changed',
        response.message || 'Your password has been changed successfully. Please log in again.',
        [{text: 'OK', onPress: () => logout()}],
      );
    } catch (err: unknown) {
      const axiosError = err as {response?: {data?: {message?: string}}};
      const message =
        axiosError?.response?.data?.message ||
        'Unable to change password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Pressable onPress={onGoBack} style={styles.backButton}>
          <ArrowLeft size={20} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.formCard}>
            <Text style={styles.cardHeading}>Update Credentials</Text>
            <Text style={styles.cardSubtitle}>
              Ensure your account uses a strong and unique password.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={18} color="#64748B" />
                </View>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showCurrent}
                  style={styles.input}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowCurrent(prev => !prev)}>
                  {showCurrent ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <KeyRound size={18} color="#64748B" />
                </View>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showNew}
                  style={styles.input}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowNew(prev => !prev)}>
                  {showNew ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <KeyRound size={18} color="#64748B" />
                </View>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirm}
                  style={styles.input}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirm(prev => !prev)}>
                  {showConfirm ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </Pressable>
              </View>
            </View>

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
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Save New Password</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 70,
  },
  backButtonPlaceholder: {
    width: 70,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 36,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
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
    borderColor: COLORS.border,
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
    color: COLORS.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: COLORS.primary,
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
  },
});

export default ChangePasswordScreen;
