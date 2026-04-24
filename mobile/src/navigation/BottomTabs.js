import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import {
  Home as HomeIcon,
  FileText,
  QrCode,
  Library,
  User,
  Wallet
} from 'lucide-react-native';
import { colors } from '../utils/colors';
import { radius, shadows } from '../utils/theme';

import Home from '../screens/Home';
import Blogs from '../screens/Blogs';
import QRScanner from '../screens/QRScanner';
import Libraries from '../screens/Libraries';
import Profile from '../screens/Profile';
import Ledger from '../screens/Ledger';

const Tab = createBottomTabNavigator();

// Custom tab bar icon with active indicator
const TabIcon = ({ icon: Icon, focused, color }) => (
  <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
    <Icon
      size={focused ? 22 : 20}
      color={focused ? '#fff' : color}
      strokeWidth={focused ? 2.5 : 1.8}
    />
  </View>
);

export default function BottomTabs() {
  const isGuest = useSelector((state) => state.auth.isGuest);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 17,
          color: colors.text,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.lightText,
        tabBarStyle: {
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          ...shadows.medium,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          let Icon;
          if (route.name === 'Home') Icon = HomeIcon;
          else if (route.name === 'Blogs') Icon = FileText;
          else if (route.name === 'QRScanner') Icon = QrCode;
          else if (route.name === 'Libraries') Icon = Library;
          else if (route.name === 'Ledger') Icon = Wallet;
          else if (route.name === 'Profile') Icon = User;
          return <TabIcon icon={Icon} focused={focused} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarLabel: 'Resources', headerShown: false }}
      />
      <Tab.Screen
        name="Blogs"
        component={Blogs}
        options={{ tabBarLabel: 'Blogs' }}
      />
      <Tab.Screen
        name="QRScanner"
        component={QRScanner}
        options={{ tabBarLabel: 'Scan QR', title: 'Presence Scanner' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            if (isGuest) {
              e.preventDefault();
              navigation.navigate('Login', { message: 'Login required for Presence Scanner' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Libraries"
        component={Libraries}
        options={{ tabBarLabel: 'Libraries', headerShown: false }}
      />
      {!isGuest && (
        <Tab.Screen
          name="Ledger"
          component={Ledger}
          options={{ tabBarLabel: 'Finance', title: 'Payments & Ledger' }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarLabel: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
