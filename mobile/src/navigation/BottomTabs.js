import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Home as HomeIcon, FileText, QrCode, Library, User } from 'lucide-react-native';
import { colors } from '../utils/colors';

// Screens
import Home from '../screens/Home';
import Blogs from '../screens/Blogs';
import QRScanner from '../screens/QRScanner';
import Libraries from '../screens/Libraries';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const isGuest = useSelector((state) => state.auth.isGuest);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.lightText,
        tabBarStyle: { 
          paddingBottom: 8, 
          height: 65,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let icon;
          if (route.name === 'Home') icon = <HomeIcon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Blogs') icon = <FileText size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'QRScanner') icon = <QrCode size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Libraries') icon = <Library size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Profile') icon = <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          return icon;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Resource' }} />
      <Tab.Screen name="Blogs" component={Blogs} options={{ tabBarLabel: 'Blogs' }} />
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
      <Tab.Screen name="Libraries" component={Libraries} options={{ tabBarLabel: 'Libraries' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: 'My Profile' }} />
    </Tab.Navigator>
  );
}
