import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../utils/colors';

import BottomTabs from './BottomTabs';
import ResourceDetail from '../screens/ResourceDetail';
import BlogDetail from '../screens/BlogDetail';
import SubmitBlog from '../screens/SubmitBlog';
import LibraryDetail from '../screens/LibraryDetail';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Attendance from '../screens/Attendance';
import Downloads from '../screens/Downloads';
import MyBooks from '../screens/MyBooks';
import BookDetail from '../screens/BookDetail';
import Ledger from '../screens/Ledger';
import ReaderScreen from '../screens/ReaderScreen';
import Notifications from '../screens/Notifications';

const Stack = createNativeStackNavigator();

const sharedHeaderOptions = {
  headerStyle: {
    backgroundColor: '#fff',
  },
  headerTintColor: colors.primary,
  headerTitleStyle: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
  },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

export default function AppNavigator({ navigationRef }) {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="BottomTabs"
        screenOptions={{
          headerShown: false,
          ...sharedHeaderOptions,
        }}
      >
        <Stack.Screen name="BottomTabs" component={BottomTabs} />
        <Stack.Screen
          name="ResourceDetail"
          component={ResourceDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BlogDetail"
          component={BlogDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SubmitBlog"
          component={SubmitBlog}
          options={{ headerShown: true, title: 'Write a Blog', ...sharedHeaderOptions }}
        />
        <Stack.Screen
          name="LibraryDetail"
          component={LibraryDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Attendance"
          component={Attendance}
          options={{ headerShown: true, title: 'Attendance History', ...sharedHeaderOptions }}
        />
        <Stack.Screen
          name="Downloads"
          component={Downloads}
          options={{ headerShown: true, title: 'My Downloads', ...sharedHeaderOptions }}
        />
        <Stack.Screen
          name="MyBooks"
          component={MyBooks}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookDetail"
          component={BookDetail}
          options={{ headerShown: true, title: 'Book Details', ...sharedHeaderOptions }}
        />
        <Stack.Screen
          name="Ledger"
          component={Ledger}
          options={{ headerShown: true, title: 'Payments & Ledger', ...sharedHeaderOptions }}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
