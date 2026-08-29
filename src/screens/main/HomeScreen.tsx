import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  Menu,
  Users,
  Megaphone,
  MapPin,
  User,
  ChevronRight,
  ShieldCheck,
  Building,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import {useAuth} from '../../context/AuthContext';
import {ModuleDrawer} from '../../components/ModuleDrawer';

const COLORS = {
  primary: '#6C4CE8',
  primaryDark: '#5635D9',
  primaryLight: '#F3F0FF',
  background: '#F8F9FD',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#10B981',
  successLight: '#ECFDF5',
  info: '#0EA5E9',
  infoLight: '#F0F9FF',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
};

interface ModuleConfig {
  id: string;
  permission: string;
  title: string;
  category: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'crm',
    permission: 'crm.access',
    title: 'CRM Suite',
    category: 'Leads & Accounts',
    subtitle: 'Manage pipelines & contacts',
    icon: <Users size={22} color="#6C4CE8" />,
    color: '#6C4CE8',
    bgColor: '#F3F0FF',
  },
  {
    id: 'marketing',
    permission: 'marketing.access',
    title: 'Marketing',
    category: 'Campaigns',
    subtitle: 'Manage outreach & automations',
    icon: <Megaphone size={22} color="#0EA5E9" />,
    color: '#0EA5E9',
    bgColor: '#F0F9FF',
  },
  {
    id: 'tours',
    permission: 'tour.access',
    title: 'Tours & Operations',
    category: 'Bookings',
    subtitle: 'Track tours & bookings',
    icon: <MapPin size={22} color="#F59E0B" />,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

const formatRole = (role: string): string => {
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const HomeScreen = () => {
  const {user} = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {width: windowWidth} = useWindowDimensions();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);

  const horizontalPadding = 20;
  const gridGap = 12;
  const cardWidth = useMemo(() => {
    return Math.floor((windowWidth - horizontalPadding * 2 - gridGap) / 2);
  }, [windowWidth]);

  const visibleModules = useMemo(() => {
    if (!user?.permissions) {
      return [];
    }
    return MODULE_CONFIGS.filter(module =>
      user.permissions.includes(module.permission),
    );
  }, [user?.permissions]);

  if (!user) {
    return (
      <View style={[styles.loadingContainer, {paddingTop: insets.top}]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing CRM Workspace...</Text>
      </View>
    );
  }

  const handleModulePress = (_moduleId: string) => {};

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/dolphin360-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Dolphin360Suite logo"
          />
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CRM Live</Text>
          </View>
        </View>

        <Pressable
          style={styles.menuButton}
          onPress={() => setIsDrawerOpen(true)}
          accessibilityLabel="Open Navigation Menu"
          accessibilityHint="Open CRM Quick Access and Modules">
          <Menu size={20} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.workspaceBanner}>
          <View style={styles.bannerTop}>
            <View style={styles.bannerAvatar}>
              <Text style={styles.bannerAvatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.bannerInfo}>
              <Text style={styles.greetingText}>{greeting},</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
              </Text>
            </View>
          </View>

          <View style={styles.bannerDivider} />

          <View style={styles.bannerMetaRow}>
            <View style={styles.metaChip}>
              <Building size={14} color={COLORS.primary} />
              <Text style={styles.metaChipText}>Tenant #{user.tenantId}</Text>
            </View>

            <View style={[styles.metaChip, styles.roleChip]}>
              <ShieldCheck size={14} color="#10B981" />
              <Text style={[styles.metaChipText, styles.roleChipText]}>
                {formatRole(user.role)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Layers size={16} color={COLORS.primary} />
              <Text style={styles.kpiValue}>{visibleModules.length}</Text>
            </View>
            <Text style={styles.kpiLabel}>Active Modules</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Sparkles size={16} color={COLORS.info} />
              <Text style={styles.kpiValueInfo}>
                {user.permissions.length}
              </Text>
            </View>
            <Text style={styles.kpiLabel}>Permissions</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <ShieldCheck size={16} color={COLORS.success} />
              <Text style={styles.kpiValueSuccess}>Active</Text>
            </View>
            <Text style={styles.kpiLabel}>Security State</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CRM Workspaces</Text>
          <Text style={styles.sectionSubtitle}>
            Select a suite module to manage your operations
          </Text>
        </View>

        <View style={styles.modulesGrid}>
          {visibleModules.map(module => (
            <Pressable
              key={module.id}
              style={({pressed}) => [
                styles.moduleCard,
                {width: cardWidth},
                pressed && styles.moduleCardPressed,
              ]}
              onPress={() => handleModulePress(module.id)}
              accessibilityLabel={`Open ${module.title}`}>
              <View style={styles.moduleTop}>
                <View
                  style={[
                    styles.moduleIconContainer,
                    {backgroundColor: module.bgColor},
                  ]}>
                  {module.icon}
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{module.category}</Text>
                </View>
              </View>

              <View style={styles.moduleBottom}>
                <Text style={styles.moduleTitle} numberOfLines={1}>
                  {module.title}
                </Text>
                <Text style={styles.moduleSubtitle} numberOfLines={2}>
                  {module.subtitle}
                </Text>
              </View>

              <View style={styles.moduleActionRow}>
                <Text style={[styles.moduleActionText, {color: module.color}]}>
                  Launch
                </Text>
                <ChevronRight size={14} color={module.color} />
              </View>
            </Pressable>
          ))}

          <Pressable
            style={({pressed}) => [
              styles.moduleCard,
              {width: cardWidth},
              pressed && styles.moduleCardPressed,
            ]}
            onPress={() => navigation.navigate('ProfileTab')}
            accessibilityLabel="Open Profile">
            <View style={styles.moduleTop}>
              <View
                style={[
                  styles.moduleIconContainer,
                  styles.profileIconContainer,
                ]}>
                <User size={22} color="#10B981" />
              </View>
              <View style={[styles.categoryBadge, styles.profileCategoryBadge]}>
                <Text style={[styles.categoryBadgeText, styles.profileCategoryBadgeText]}>
                  Executive
                </Text>
              </View>
            </View>

            <View style={styles.moduleBottom}>
              <Text style={styles.moduleTitle} numberOfLines={1}>
                Profile & Access
              </Text>
              <Text style={styles.moduleSubtitle} numberOfLines={2}>
                Credentials & role matrix
              </Text>
            </View>

            <View style={styles.moduleActionRow}>
              <Text style={[styles.moduleActionText, styles.profileActionText]}>
                Manage
              </Text>
              <ChevronRight size={14} color="#10B981" />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <ModuleDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 140,
    height: 36,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
    letterSpacing: 0.2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 36,
  },
  workspaceBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    marginBottom: 16,
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  bannerAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  bannerDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 14,
  },
  bannerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  roleChip: {
    backgroundColor: COLORS.successLight,
  },
  roleChipText: {
    color: COLORS.success,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  kpiValueInfo: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.info,
  },
  kpiValueSuccess: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.success,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
    minHeight: 170,
    justifyContent: 'space-between',
  },
  moduleCardPressed: {
    opacity: 0.88,
    transform: [{scale: 0.98}],
  },
  moduleTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  moduleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconContainer: {
    backgroundColor: '#ECFDF5',
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  profileCategoryBadge: {
    backgroundColor: '#ECFDF5',
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  profileCategoryBadgeText: {
    color: '#10B981',
  },
  moduleBottom: {
    marginVertical: 10,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  moduleSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  moduleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  moduleActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileActionText: {
    color: '#10B981',
  },
});

export default HomeScreen;
