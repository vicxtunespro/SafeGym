
import { useAuthStore } from '@/stores/useAuthStore';
import { Stack } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';
import '../global.css';

export default function RootLayout() {

  const { user, newUser, role } = useAuthStore();
  console.log(role)

  return (
    <React.Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={newUser} >
          <Stack.Screen name='(onBoard)'/>
        </Stack.Protected>

        <Stack.Protected guard={!user || !role} >
          <Stack.Screen name='(auth)'/>
        </Stack.Protected>

        <Stack.Protected guard={role === "trainer"} >
          <Stack.Screen name='Trainer'/>
        </Stack.Protected>

        <Stack.Protected guard={role === "user"} >
          <Stack.Screen name='Client'/>
        </Stack.Protected>

        <Stack.Protected guard={role === "admin"} >
          <Stack.Screen name='Admin'/>
        </Stack.Protected>

      </Stack>
      <Toast />
    </React.Fragment>
  )
}
