import { LoginWithEmail } from '@/services/authService';
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setRole } = useAuthStore();

  const router = useRouter();
  const {setUser, user, role} = useAuthStore();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userData = await LoginWithEmail(email, password);
      // console.log("role has issues ", userData.role);

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: `Welcome back, ${userData?.firstName || 'User'}!`,
      });

      router.replace('/Client/home');
      
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1  items-center px-6 py-8">
          <Image
            source={require('@/assets/images/logo2.png')}
            className="w-48 h-48 mb-6"
            resizeMode="contain"
          />

          <Text className="text-2xl font-bold text-orange-400 mb-6">
            Log into your account
          </Text>

          {/* Email Input */}
          <View className="w-full md:w-1/2 mb-4">
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Password Input with Toggle */}
          <View className="w-full md:w-1/2 mb-4 relative">
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base pr-10"
            />
            <Pressable
              className="absolute right-3 top-3"
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? 'visibility-off' : 'visibility'} 
                size={20} 
                color="#666" 
              />
            </Pressable>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="w-full md:w-1/2 bg-orange-400 py-3 rounded-xl mb-3"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-semibold text-base">
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* Links Container */}
          <View className="w-full md:w-1/2 items-center">
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text className="text-orange-500 underline mb-4">
                  Forgot password?
                </Text>
              </Pressable>
            </Link>

            <View className="flex-row">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text className="text-orange-500 font-semibold">
                    Sign Up
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
  );
}