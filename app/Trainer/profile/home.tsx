
import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';


export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();
  const [residentData, setResidentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);



useEffect(() => {
  let unsubscribe: () => void;

  const fetchTrainerDataRealtime = async () => {
    if (user) {
      try {
        setLoading(true);
        const residentRef = doc(db, 'users', user.id);

        unsubscribe = onSnapshot(residentRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setResidentData(data);
            //useAuthStore.getState().setProfile(data); // Update Zustand store
            console.log("Current resident data:", data);
          } else {
            console.log("No resident document found");
          }
        });

      } catch (error) {
        console.error('Error setting up realtime listener:', error);
        Toast.show({
          type: 'error',
          text1: 'Connection Error',
          text2: 'Could not establish realtime connection',
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No user authenticated");
    }
  };

  fetchTrainerDataRealtime();

  // Cleanup subscription on unmount
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [user?.id]); // Only re-run if user UID changes

  const handleLogout = async () => {
    try {
      await clearAuth();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-gray-100 flex-1">
      {/* Profile Header */}
      <View className="bg-orange-400 pt-12 p-6">
        <View className="flex-row items-center">
          <Image 
            source={{
              uri: residentData?.profilePicture || 'https://via.placeholder.com/150',
            }}
            className="w-16 h-16 rounded-full border-2 border-white"
            resizeMode='contain'
           />
         
          <View className="ml-4">
            <Text className="text-white text-xl font-bold">
              {residentData?.firstName} {residentData?.lastName}
            </Text>
            <Text className="text-gray-50">{residentData?.email}</Text>
          </View>
        </View>
      </View>

      {/* Profile Details */}
      <View className="p-6">
        <View className="bg-white rounded-lg p-6 shadow-sm">
          <View className="mb-6">
            <Text className="text-sm text-orange-600">Personal Information</Text>
            <View className="mt-4 space-y-4">
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">First Name</Text>
                <Text className="font-medium">{residentData?.firstName}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Last Name</Text>
                <Text className="font-medium">{residentData?.lastName}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Email</Text>
                <Text className="font-medium">{residentData?.email}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Phone</Text>
                <Text className="font-medium">{residentData?.phone || 'Not provided'}</Text>
              </View>
            </View>
          </View>

          <View className="mt-6 mb-6">
            <Text className="text-orange-600 text-sm">Account</Text>
            <View className="mt-4 space-y-4">
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                <Text className="text-gray-500">Trainer Since</Text>
                <Text className="font-medium">
                  {new Date(residentData?.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Role</Text>
                <Text className="font-medium">{residentData?.role.toUpperCase() || ""}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/Trainer/profile/edit')}
            className="flex-row items-center justify-center py-3 border border-orange-500 rounded-lg mt-4"
          >
            <MaterialIcons name="edit" size={18} color="#f65302" />
            <Text className="text-orange-600 font-medium ml-2">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Sections */}
        <View className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <Text className="text-orange-600 text-sm">Ratings</Text>
          <View className="mt-4 space-y-4">
            <TouchableOpacity className="flex-row justify-between items-center">
              <Text>Rate our App on play store</Text>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-8 flex-row items-center justify-center py-3 border border-red-500 rounded-lg"
        >
          <MaterialIcons name="logout" size={18} color="#ef4444" />
          <Text className="text-red-500 font-medium ml-2">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
