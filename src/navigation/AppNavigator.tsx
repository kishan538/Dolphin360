import React, {useState} from 'react';
import {ActivityIndicator, Platform, StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Home, User, Menu} from 'lucide-react-native';

import {AuthProvider, useAuth} from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import type {AuthStackParamList} from './AuthStackParamList';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import MoreScreen from '../screens/main/MoreScreen';
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen';

const COLORS = {
  primary: '#6C4CE8',
  textSecondary: '#6B7280',
  card: '#FFFFFF',
  border: '#E5E7EB',
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator();

const renderHomeIcon = ({color, size}: {color: string; size: number}) => (
  <Home size={size - 2} color={color} />
);

const renderProfileIcon = ({color, size}: {color: string; size: number}) => (
  <User size={size - 2} color={color} />
);

const renderMoreIcon = ({color, size}: {color: string; size: number}) => (
  <Menu size={size - 2} color={color} />
);

const MoreStackNavigator = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (showChangePassword) {
    return (
      <ChangePasswordScreen
        onGoBack={() => setShowChangePassword(false)}
      />
    );
  }

  return (
    <MoreScreen
      onNavigateChangePassword={() => setShowChangePassword(true)}
    />
  );
};

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? (bottomInset > 0 ? bottomInset : 8) : 8,
          height: (Platform.OS === 'ios' ? 54 : 60) + bottomInset,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}>
      <MainTab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <MainTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
      <MainTab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: renderMoreIcon,
        }}
      />
    </MainTab.Navigator>
  );
};

const AppContent = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthStack.Navigator screenOptions={{headerShown: false}}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </AuthStack.Navigator>
    );
  }

  return <MainTabNavigator />;
};

const AppNavigator = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8FC',
  },
});

export default AppNavigator;