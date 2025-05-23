import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/stores/useAuthStore';
import { userManager } from '@/services/resourceManager';
import clsx from 'clsx';
import { Alert } from 'react-native';

// Define TypeScript interface for user data
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt?: string | number;
  echoPoints?: number;
}

export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();
  const [residentData, setResidentData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch resident data in real-time
  useEffect(() => {
    let unsubscribe: () => void;

    const fetchResidentDataRealtime = async () => {
      if (!user?.id) {
        console.log('No user authenticated');
        setInitialLoading(false);
        return;
      }

      try {
        const residentRef = doc(db, 'users', user.id);

        unsubscribe = onSnapshot(
          residentRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserData;
              setResidentData(data);
              setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phone: data.phone || '',
                email: data.email || '',
              });
            } else {
              console.log('No resident document found');
              setResidentData(null);
              Toast.show({
                type: 'info',
                text1: 'No Profile Data',
                text2: 'Please complete your profile',
              });
            }
            setInitialLoading(false);
          },
          (error) => {
            console.error('Realtime listener error:', error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to fetch profile updates',
            });
            setInitialLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up realtime listener:', error);
        Toast.show({
          type: 'error',
          text1: 'Connection Error',
          text2: 'Could not establish realtime connection',
        });
        setInitialLoading(false);
      }
    };

    fetchResidentDataRealtime();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  // Input validation
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'First name is required',
      });
      return false;
    }
    if (!formData.lastName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Last name is required',
      });
      return false;
    }
    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Invalid phone number format',
      });
      return false;
    }
    return true;
  };

  // Handle save action
  const handleSave = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Save Changes',
      'Are you sure you want to save your profile changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            setSaving(true);
            try {
              const updateData: Partial<UserData> = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phone: formData.phone?.trim() || residentData?.phone || '',
              };

              await userManager.updateResource(user!.id, updateData);

              Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Your changes have been saved successfully',
              });

              setEditMode(false);
            } catch (error) {
              console.error('Error updating profile:', error);
              Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: 'There was an error saving your profile',
              });
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  // Handle reset action
  const handleReset = () => {
    if (residentData) {
      setFormData({
        firstName: residentData.firstName || '',
        lastName: residentData.lastName || '',
        phone: residentData.phone || '',
        email: residentData.email || '',
      });
      Toast.show({
        type: 'info',
        text1: 'Form Reset',
        text2: 'Form has been reset to original values',
      });
    }
  };

  // Handle logout with confirmation
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAuth();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: 'An error occurred while logging out',
              });
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text>Loading profile...</Text>
      </View>
    );
  }

  // Empty state
  if (!residentData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-lg font-medium text-gray-700">No Profile Data</Text>
        <Text className="text-gray-500 mt-2">Please complete your profile.</Text>
        <TouchableOpacity
          onPress={() => setEditMode(true)}
          className="mt-4 py-3 px-6 bg-emerald-500 rounded-lg"
          accessibilityLabel="Set Up Profile"
          accessibilityHint="Start editing your profile"
        >
          <Text className="text-white font-medium">Set Up Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="bg-gray-50 flex-1">
      {editMode ? (
        <View className="p-6">
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-6">Edit Profile</Text>

            {/* First Name */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">First Name</Text>
              <TextInput
                className="border border-gray-200 rounded-lg px-4 py-3"
                placeholder={residentData.firstName || "Enter your first name"}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                accessibilityLabel="First Name"
                accessibilityHint="Enter your first name"
              />
            </View>

            {/* Last Name */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Last Name</Text>
              <TextInput
                className="border border-gray-200 rounded-lg px-4 py-3"
                placeholder={residentData.lastName || "Enter your last name"}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                accessibilityLabel="Last Name"
                accessibilityHint="Enter your last name"
              />
            </View>

            {/* Phone Number */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
              <TextInput
                className="border border-gray-200 rounded-lg px-4 py-3"
                placeholder={residentData.phone || "Enter your phone number (optional)"}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                accessibilityLabel="Phone Number"
                accessibilityHint="Enter your phone number"
              />
            </View>

            {/* Save Button (Next) */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className={clsx(
                'py-3 rounded-lg flex-row items-center justify-center',
                saving ? 'bg-emerald-400' : 'bg-emerald-500'
              )}
              accessibilityLabel="Save Changes"
              accessibilityHint="Save your profile changes"
            >
              {saving && <MaterialIcons name="hourglass-empty" size={18} color="#fff" />}
              <Text className="text-white font-medium text-center ml-2">
                {saving ? 'Saving...' : 'Next'}
              </Text>
            </TouchableOpacity>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleReset}
              disabled={saving}
              className={clsx(
                'mt-4 py-3 border rounded-lg flex-row items-center justify-center',
                saving ? 'border-gray-300' : 'border-emerald-500'
              )}
              accessibilityLabel="Reset Form"
              accessibilityHint="Reset the form to original values"
            >
              <MaterialIcons name="restart-alt" size={18} color={saving ? '#d1d5db' : '#059669'} />
              <Text
                className={clsx(
                  'font-medium text-center ml-2',
                  saving ? 'text-gray-400' : 'text-emerald-600'
                )}
              >
                Reset
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setEditMode(false)}
              disabled={saving}
              className={clsx(
                'mt-4 py-3 border rounded-lg flex-row items-center justify-center',
                saving ? 'border-gray-300' : 'border-gray-300'
              )}
              accessibilityLabel="Cancel"
              accessibilityHint="Exit edit mode without saving"
            >
              <MaterialIcons name="cancel" size={18} color={saving ? '#d1d5db' : '#6b7280'} />
              <Text
                className={clsx(
                  'font-medium text-center ml-2',
                  saving ? 'text-gray-400' : 'text-gray-700'
                )}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* Profile Header */}
          <View className="bg-emerald-600 pt-12 p-6">
            <View className="flex-row items-center">
              <View className="bg-emerald-100 p-4 rounded-full">
                <MaterialIcons name="account-circle" size={40} color="#059669" />
              </View>
              <View className="ml-4">
                <Text className="text-white text-xl font-bold">
                  {residentData.firstName} {residentData.lastName}
                </Text>
                <Text className="text-emerald-100">{residentData.email}</Text>
              </View>
            </View>
          </View>

          {/* Profile Details */}
          <View className="p-6">
            <View className="bg-white rounded-lg p-6 shadow-sm">
              <View className="mb-6">
                <Text className="text-sm text-emerald-600">Personal Information</Text>
                <View className="mt-4 space-y-4">
                  <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                    <Text className="text-gray-500">First Name</Text>
                    <Text className="font-medium">{residentData.firstName}</Text>
                  </View>
                  <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                    <Text className="text-gray-500">Last Name</Text>
                    <Text className="font-medium">{residentData.lastName}</Text>
                  </View>
                  <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                    <Text className="text-gray-500">Email</Text>
                    <Text className="font-medium">{residentData.email}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500">Phone</Text>
                    <Text className="font-medium">{residentData.phone || 'Not provided'}</Text>
                  </View>
                </View>
              </View>

              <View className="mt-6 mb-6">
                <Text className="text-emerald-600 text-sm">Account</Text>
                <View className="mt-4 space-y-4">
                  <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                    <Text className="text-gray-500">Member Since</Text>
                    <Text className="font-medium">
                      {residentData.createdAt
                        ? new Date(residentData.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500">Echo Points</Text>
                    <Text className="font-medium">{residentData.echoPoints ?? 0}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setEditMode(true)}
                className="flex-row items-center justify-center py-3 border border-emerald-500 rounded-lg mt-4"
                accessibilityLabel="Edit Profile"
                accessibilityHint="Enter edit mode to modify your profile"
              >
                <MaterialIcons name="edit" size={18} color="#059669" />
                <Text className="text-emerald-600 font-medium ml-2">Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Ratings Section */}
            <View className="mt-6 bg-white rounded-lg p-6 shadow-sm">
              <Text className="text-emerald-600 text-sm">Ratings</Text>
              <View className="mt-4 space-y-4">
                <TouchableOpacity
                  className="flex-row justify-between items-center"
                  accessibilityLabel="Rate App"
                  accessibilityHint="Navigate to rate the app on the Play Store"
                >
                  <Text>Rate our App on Play Store</Text>
                  <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              className="mt-8 flex-row items-center justify-center py-3 border border-red-500 rounded-lg"
              accessibilityLabel="Log Out"
              accessibilityHint="Sign out of your account"
            >
              <MaterialIcons name="logout" size={18} color="#ef4444" />
              <Text className="text-red-500 font-medium ml-2">Log Out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}