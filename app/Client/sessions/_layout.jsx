import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function SessionsLayout() {
  return (
    <Stack>
        <Stack.Screen name="sessions" options={{ title: 'Sessions' }} />
        <Stack.Screen name="[id]" options={{ title: 'Session Details' }} />
    </Stack>
  )
}

const styles = StyleSheet.create({})