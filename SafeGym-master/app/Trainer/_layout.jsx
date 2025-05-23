import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function TrainerLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,}}>
      <Tabs.Screen name="home"/>
      <Tabs.Screen name="sessions"/>
      <Tabs.Screen name="profile"/>
    </Tabs>
  )
}

const styles = StyleSheet.create({})