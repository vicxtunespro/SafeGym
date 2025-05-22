import { useAuthStore } from '@/stores/useAuthStore';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function AdminLayout() {
    const { role } = useAuthStore();

  return (
      <Stack>
        <Stack.Screen name="dashboard"></Stack.Screen>
        <Stack.Screen name="sessions"></Stack.Screen>
        <Stack.Screen name="trainers"></Stack.Screen>
        {/* <Stack.Screen name="dashboard"></Stack.Screen> */}
      </Stack>

  )
}

const styles = StyleSheet.create({})