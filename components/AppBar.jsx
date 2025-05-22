import { Image, StyleSheet, View } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

export default function AppBar() {
  return (
    <View className="flex-row items-center justify-between p-2 bg-white shadow-md">
      <Image 
        source={require('@/assets/images/logo2.png')}
        style={{ width: 80, height: 80 }}
        resizeMode="contain"
      />
      <View className="flex-row items-center p-4 rounded-full bg-gray-200">
          <Feather name="user" size={24} color="#333" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({})