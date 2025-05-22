import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function ProfileLayout() {
  return (
    <Stack>
        <Stack.Screen name='home' options={{ headerShown: false }} />
        <Stack.Screen name='edit' options={{ title: 'Edit Profile', headerBackButtonDisplayMode: true }} />
    </Stack>
  )
}

const styles = StyleSheet.create({})