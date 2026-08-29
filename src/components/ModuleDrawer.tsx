import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  X,
  ArrowLeft,
  Package,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Boxes,
  Layers,
  FileText,
  Hash,
  Tag,
  Info,
} from 'lucide-react-native';
import {getModules, Module} from '../api/modules';

const COLORS = {
  primary: '#6C4CE8',
  primaryLight: '#F3F0FF',
  background: '#FFFFFF',
  surfaceLight: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  bannerBg: '#F5F3FF',
  bannerBorder: '#EDE9FE',
  bannerText: '#5B21B6',
  success: '#10B981',
  successLight: '#ECFDF5',
  error: '#EF4444',
  errorLight: '#FEF2F2',
};

type DrawerView = 'quick_access' | 'modules_list' | 'module_detail';

interface ModuleDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const ModuleDrawer: React.FC<ModuleDrawerProps> = ({visible, onClose}) => {
  const insets = useSafeAreaInsets();
  const {width: screenWidth} = useWindowDimensions();
  const drawerWidth = Math.min(screenWidth * 0.84, 340);

  const [currentView, setCurrentView] = useState<DrawerView>('quick_access');
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: drawerWidth,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentView('quick_access');
        setSelectedModule(null);
        setErrorMessage(null);
      });
    }
  }, [visible, drawerWidth, fadeAnim, slideAnim]);

  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (currentView === 'module_detail') {
        setCurrentView('modules_list');
        setSelectedModule(null);
        return true;
      }
      if (currentView === 'modules_list') {
        setCurrentView('quick_access');
        return true;
      }
      onClose();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [visible, currentView, onClose]);

  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await getModules();
      const list = res?.data?.modules || (Array.isArray(res?.data) ? res.data : []);
      setModules(list as Module[]);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setErrorMessage("You don't have permission to access this module.");
      } else if (err?.response?.status === 401) {
        setErrorMessage('Your session has expired. Please sign in again.');
      } else if (err?.message?.includes('Network Error') || err?.message?.includes('timeout')) {
        setErrorMessage('Unable to connect to server. Please try again.');
      } else {
        setErrorMessage(err?.response?.data?.message || 'Unable to load modules. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpenModules = () => {
    setCurrentView('modules_list');
    if (modules.length === 0) {
      fetchModules();
    }
  };

  const handleGoBack = () => {
    if (currentView === 'module_detail') {
      setCurrentView('modules_list');
      setSelectedModule(null);
    } else if (currentView === 'modules_list') {
      setCurrentView('quick_access');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleGoBack}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, {opacity: fadeAnim}]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{translateX: slideAnim}],
            },
          ]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {currentView !== 'quick_access' && (
                <Pressable
                  style={styles.iconBtn}
                  onPress={handleGoBack}
                  accessibilityLabel="Back"
                  accessibilityRole="button">
                  <ArrowLeft size={18} color={COLORS.textPrimary} />
                </Pressable>
              )}
              <View style={styles.headerTitles}>
                <Text style={styles.title} numberOfLines={1}>
                  {currentView === 'quick_access'
                    ? 'Quick Access'
                    : currentView === 'modules_list'
                    ? 'Modules'
                    : selectedModule?.name || 'Module Details'}
                </Text>
                <Text style={styles.subtitle}>
                  {currentView === 'quick_access'
                    ? 'Workspace Navigation'
                    : currentView === 'modules_list'
                    ? 'Available Modules'
                    : 'Module Information'}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.iconBtn}
              onPress={onClose}
              accessibilityLabel="Close"
              accessibilityRole="button">
              <X size={18} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {currentView === 'quick_access' && (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <View style={styles.banner}>
                  <Info size={15} color={COLORS.primary} />
                  <Text style={styles.bannerText}>
                    Quickly launch features and browse assigned CRM tools.
                  </Text>
                </View>

                <Text style={styles.sectionHeader}>CRM TOOLS</Text>

                <Pressable
                  style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
                  onPress={handleOpenModules}
                  accessibilityLabel="Modules, Browse available CRM modules"
                  accessibilityRole="button">
                  <View style={styles.cardLeft}>
                    <View style={styles.iconContainer}>
                      <Package size={22} color={COLORS.primary} />
                    </View>
                    <View style={styles.cardTexts}>
                      <Text style={styles.cardTitle}>Modules</Text>
                      <Text style={styles.cardSubtitle}>
                        Browse available CRM modules
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={COLORS.textTertiary} />
                </Pressable>
              </ScrollView>
            )}

            {currentView === 'modules_list' && (
              <View style={styles.fill}>
                {isLoading ? (
                  <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading modules...</Text>
                  </View>
                ) : errorMessage ? (
                  <View style={styles.centered}>
                    <View style={styles.errorCircle}>
                      <AlertCircle size={30} color={COLORS.error} />
                    </View>
                    <Text style={styles.stateTitle}>Error</Text>
                    <Text style={styles.stateSubtitle}>{errorMessage}</Text>
                    <Pressable
                      style={styles.primaryBtn}
                      onPress={fetchModules}
                      accessibilityRole="button">
                      <RefreshCw size={15} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Try Again</Text>
                    </Pressable>
                  </View>
                ) : modules.length === 0 ? (
                  <View style={styles.centered}>
                    <View style={styles.emptyCircle}>
                      <Boxes size={34} color={COLORS.textTertiary} />
                    </View>
                    <Text style={styles.stateTitle}>No modules available</Text>
                    <Text style={styles.stateSubtitle}>
                      There are currently no CRM modules available for your account.
                    </Text>
                    <Pressable
                      style={styles.outlineBtn}
                      onPress={fetchModules}
                      accessibilityRole="button">
                      <RefreshCw size={14} color={COLORS.primary} />
                      <Text style={styles.outlineBtnText}>Refresh</Text>
                    </Pressable>
                  </View>
                ) : (
                  <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionHeader}>
                      {modules.length} {modules.length === 1 ? 'MODULE AVAILABLE' : 'MODULES AVAILABLE'}
                    </Text>

                    {modules.map(mod => (
                      <Pressable
                        key={mod.id ?? mod.slug ?? mod.name}
                        style={({pressed}) => [styles.listItem, pressed && styles.cardPressed]}
                        onPress={() => {
                          setSelectedModule(mod);
                          setCurrentView('module_detail');
                        }}
                        accessibilityRole="button">
                        <View style={styles.listItemLeft}>
                          <View style={styles.listItemIcon}>
                            <Package size={19} color={COLORS.primary} />
                          </View>
                          <View style={styles.listItemTexts}>
                            <View style={styles.row}>
                              <Text style={styles.listItemTitle} numberOfLines={1}>
                                {mod.name || 'Unnamed Module'}
                              </Text>
                              {mod.id != null && (
                                <View style={styles.badge}>
                                  <Text style={styles.badgeText}>#{mod.id}</Text>
                                </View>
                              )}
                            </View>
                            {mod.slug ? (
                              <Text style={styles.listItemSlug} numberOfLines={1}>
                                {mod.slug}
                              </Text>
                            ) : null}
                            {mod.description ? (
                              <Text style={styles.listItemDesc} numberOfLines={2}>
                                {mod.description}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                        <ChevronRight size={18} color={COLORS.textTertiary} />
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {currentView === 'module_detail' && selectedModule && (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.detailBanner}>
                  <View style={styles.detailIconBox}>
                    <Package size={26} color="#FFFFFF" />
                  </View>
                  <Text style={styles.detailTitle}>
                    {selectedModule.name || 'Module'}
                  </Text>
                  {selectedModule.slug ? (
                    <View style={styles.slugBadge}>
                      <Tag size={11} color={COLORS.primary} />
                      <Text style={styles.slugBadgeText}>{selectedModule.slug}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Module Information</Text>

                  {selectedModule.id != null && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailRowHeader}>
                        <Hash size={13} color={COLORS.textSecondary} />
                        <Text style={styles.detailLabel}>Module ID</Text>
                      </View>
                      <Text style={styles.detailValue}>{String(selectedModule.id)}</Text>
                    </View>
                  )}

                  {selectedModule.name ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailRowHeader}>
                        <Package size={13} color={COLORS.textSecondary} />
                        <Text style={styles.detailLabel}>Name</Text>
                      </View>
                      <Text style={styles.detailValue}>{selectedModule.name}</Text>
                    </View>
                  ) : null}

                  {selectedModule.slug ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailRowHeader}>
                        <Tag size={13} color={COLORS.textSecondary} />
                        <Text style={styles.detailLabel}>Slug</Text>
                      </View>
                      <Text style={styles.detailValue}>{selectedModule.slug}</Text>
                    </View>
                  ) : null}

                  <View style={styles.detailRow}>
                    <View style={styles.detailRowHeader}>
                      <FileText size={13} color={COLORS.textSecondary} />
                      <Text style={styles.detailLabel}>Description</Text>
                    </View>
                    <Text
                      style={
                        selectedModule.description
                          ? styles.detailValue
                          : styles.detailValueMuted
                      }>
                      {selectedModule.description?.trim() || 'No description provided.'}
                    </Text>
                  </View>

                  {Object.entries(selectedModule)
                    .filter(
                      ([k, v]) =>
                        !['id', 'name', 'slug', 'description'].includes(k) &&
                        v != null &&
                        v !== '',
                    )
                    .map(([key, val]) => {
                      const display =
                        typeof val === 'boolean'
                          ? val ? 'Enabled' : 'Disabled'
                          : typeof val === 'object'
                          ? JSON.stringify(val)
                          : String(val);

                      return (
                        <View key={key} style={styles.detailRow}>
                          <View style={styles.detailRowHeader}>
                            <Layers size={13} color={COLORS.textSecondary} />
                            <Text style={styles.detailLabel}>
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                            </Text>
                          </View>
                          <Text style={styles.detailValue}>{display}</Text>
                        </View>
                      );
                    })}
                </View>

                <View style={styles.statusBox}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    Active & connected to Dolphin360 CRM API
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    height: '100%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: {width: -4, height: 0},
    elevation: 20,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitles: {
    flex: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fill: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.bannerBg,
    borderWidth: 1,
    borderColor: COLORS.bannerBorder,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    marginBottom: 20,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.bannerText,
    fontWeight: '500',
    lineHeight: 17,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: '#CBD5E1',
    transform: [{scale: 0.985}],
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTexts: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
    marginBottom: 10,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  listItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  listItemTexts: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  listItemSlug: {
    fontSize: 11.5,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  listItemDesc: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 15,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  errorCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stateSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
    marginBottom: 12,
  },
  detailIconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  slugBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 6,
  },
  slugBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  detailCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  detailRow: {
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  detailValueMuted: {
    fontSize: 12.5,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
});

export default ModuleDrawer;
