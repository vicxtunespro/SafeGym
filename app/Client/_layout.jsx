import { Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function ClientLayout() {
  return (
    <Tabs>
        <Tabs.Screen name="home" options={{ headerShown: false }}/>
        <Tabs.Screen name="session" />
        <Tabs.Screen name="profile" />
    </Tabs>
  )
}

const styles = StyleSheet.create({})