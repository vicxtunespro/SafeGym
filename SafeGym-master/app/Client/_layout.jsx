import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide header for all tabs
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="session" options={{ title: 'Session' }} />
      <Tabs.Screen name="profile" options={{ title: 'profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({});