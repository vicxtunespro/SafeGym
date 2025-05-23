import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function SessionsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="sessions" 
        options={{ 
          title: 'Available Sessions',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Session Details',
          headerShown: true,
          presentation: 'modal'
        }} 
      />
    </Stack>
  )
}

const styles = StyleSheet.create({})