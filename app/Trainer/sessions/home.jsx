import { Link } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

export default function SessionScreen() {
  return (
    <View>
      <Text>SessionScreen</Text>
      <Link href={'/Trainer/sessions/create'} asChild>
        <Text style={{ color: 'blue' }}>Create Session</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({})