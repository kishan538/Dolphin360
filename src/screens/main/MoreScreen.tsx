import React, {useState} from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  KeyRound,
  LogOut,
  Info,
  ChevronRight,
  Shield,
  Server,
} from 'lucide-react-native';
import {useAuth} from '../../context/AuthContext';

const COLORS = {
  primary: '#6C4CE8',
  primaryLight: '#F3F0FF',
  background: '#F8F9FD',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  success: '#10B981',
};

interface MoreScreenProps {
  onNavigateChangePassword: () => void;
}

const MoreScreen = ({onNavigateChangePassword}: MoreScreenProps) => {
  const {logout} = useAuth();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your CRM session?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System & Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Account Security</Text>
        <View style={styles.menuCard}>
          <Pressable
            style={({pressed}) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={onNavigateChangePassword}
            accessibilityLabel="Change Password">
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, styles.iconSecurity]}>
                <KeyRound size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.menuText}>Change Password</Text>
                <Text style={styles.menuSubtext}>Update your CRM account credentials</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textTertiary} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>CRM Environment</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, styles.iconInfo]}>
                <Info size={18} color="#0EA5E9" />
              </View>
              <View>
                <Text style={styles.menuText}>Dolphin360Suite Enterprise</Text>
                <Text style={styles.menuSubtext}>Version 1.0.0 (Production)</Text>
              </View>
            </View>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>v1.0</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, styles.iconLive]}>
                <Server size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.menuText}>API Gateway</Text>
                <Text style={styles.menuSubtext}>api.dolfin360.com (Connected)</Text>
              </View>
            </View>
            <View style={[styles.statusChip, styles.statusChipLive]}>
              <Text style={[styles.statusChipText, styles.statusChipLiveText]}>Live</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, styles.iconStorage]}>
                <Shield size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.menuText}>Storage Security</Text>
                <Text style={styles.menuSubtext}>Encrypted Keystore / Keychain</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <Pressable
            style={({pressed}) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={handleLogout}
            disabled={loggingOut}
            accessibilityLabel="Sign Out">
            <LogOut size={18} color={COLORS.error} />
            <Text style={styles.logoutText}>
              {loggingOut ? 'Signing out...' : 'Sign Out of CRM'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 36,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemPressed: {
    backgroundColor: '#F8FAFC',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSecurity: {
    backgroundColor: COLORS.primaryLight,
  },
  iconInfo: {
    backgroundColor: '#F0F9FF',
  },
  iconLive: {
    backgroundColor: '#ECFDF5',
  },
  iconStorage: {
    backgroundColor: '#FFFBEB',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipLive: {
    backgroundColor: '#ECFDF5',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusChipLiveText: {
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 66,
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.errorLight,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonPressed: {
    opacity: 0.85,
    transform: [{scale: 0.99}],
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },
});

export default MoreScreen;
