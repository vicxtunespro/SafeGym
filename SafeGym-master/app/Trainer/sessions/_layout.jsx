import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function SessionLayout() {
  return (
    <Stack >
       <Stack.Screen name='home' options={{ headerShown: false }} />
       <Stack.Screen name='create' options={{ title: 'Create New Session', headerBackButtonDisplayMode: true }} />
       <Stack.Screen name='edit' options={{ title: 'Create Session' }} />
    </Stack>
  )
}

const styles = StyleSheet.create({})