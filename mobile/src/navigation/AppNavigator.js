import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BottomTabs" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BottomTabs" component={BottomTabs} />
        <Stack.Screen name="ResourceDetail" component={ResourceDetail} options={{ headerShown: true, title: 'Resource Details' }} />
        <Stack.Screen name="BlogDetail" component={BlogDetail} options={{ headerShown: true, title: 'Blog Details' }} />
        <Stack.Screen name="SubmitBlog" component={SubmitBlog} options={{ headerShown: true, title: 'Submit Blog' }} />
        <Stack.Screen name="LibraryDetail" component={LibraryDetail} options={{ headerShown: true, title: 'Library Details' }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: true, title: 'Login' }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: true, title: 'Register' }} />
        <Stack.Screen name="Attendance" component={Attendance} options={{ headerShown: true, title: 'Attendance' }} />
        <Stack.Screen name="Downloads" component={Downloads} options={{ headerShown: true, title: 'Downloads / Books' }} />
        <Stack.Screen name="MyBooks" component={MyBooks} options={{ headerShown: true, title: 'My Borrowed Books' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
