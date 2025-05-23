import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router'; // Import useNavigation

export default function AppBar() {
 

  const handleProfilePress = () => {
    const user = getAuth().currentUser; // Get current Firebase user
    if (user) {
      router.push('/Client/profile'); // Navigate to profile screen
    } else {
      router.replace('/(auth)/login'); // Navigate to SignIn if not authenticated
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo2.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity onPress={handleProfilePress}>
        <View style={styles.profileButton}>
          <Feather name="user" size={24} color="#333" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: { width: 80, height: 80 },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
});