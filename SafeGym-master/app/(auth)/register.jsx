
import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import ClientRegistration from '@/components/ClientRegistration';

export default function Register() {
  const { role } = useLocalSearchParams();
  console.log(role);
  const { role: storedRole } = useAuthStore();

  // Use either the URL param or stored role
  const currentRole = role || storedRole;

  return (
    <View className="flex-1">
      {/* Role-specific registration form */}
      {!currentRole ? <ClientRegistration /> : <Redirect href="/(auth)/login" />}
    </View>
  );
}