import { storage } from '@/firebase/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { Alert, Image, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function CreateSessionForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'group',
    dateTime: new Date(),
    duration: '60',
    maxParticipants: '10',
    difficulty: 'intermediate',
    isRecurring: false,
    recurrencePattern: 'weekly',
    recurrenceEndDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    coverPhotoUrl: null
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRecurrenceEndPicker, setShowRecurrenceEndPicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [localImageUri, setLocalImageUri] = useState(null);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all required fields',
        text2: 'Title and Description are required.'
    });
      return;
    }

  };

  const handleDateTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dateTime;
    setShowDatePicker(false);
    setFormData({...formData, dateTime: currentDate});
  };

  const handleRecurrenceEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.recurrenceEndDate;
    setShowRecurrenceEndPicker(false);
    setFormData({...formData, recurrenceEndDate: currentDate});
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      // Fetch the image from the local URI
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a unique filename
      const filename = `session-covers/${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const storageRef = ref(storage, filename);
      
      // Upload the file
      await uploadBytes(storageRef, blob);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Update form data with the download URL
      setFormData({...formData, coverPhotoUrl: downloadUrl});
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Create New Session</Text>

        {/* Cover Photo */}
        <TouchableOpacity 
          onPress={pickImage} 
          className="mb-6"
          disabled={uploading}
        >
          {localImageUri || formData.coverPhotoUrl ? (
            <Image 
              source={{ uri: localImageUri || formData.coverPhotoUrl }} 
              className="w-full h-48 rounded-xl"
            />
          ) : (
            <View className="bg-gray-200 w-full h-48 rounded-xl flex items-center justify-center">
              {uploading ? (
                <Text className="text-gray-500">Uploading image...</Text>
              ) : (
                <Text className="text-gray-500">Tap to add cover photo</Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Basic Information */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Basic Information</Text>
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-800 font-medium mb-1">Title*</Text>
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-4"
            placeholder="Morning Yoga Flow"
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
          />

          <Text className="text-gray-800 font-medium mb-1">Description*</Text>
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-4 h-24"
            placeholder="Describe the session..."
            multiline
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
          />

          <Text className="text-gray-800 font-medium mb-1">Session Type*</Text>
          <Picker
            selectedValue={formData.type}
            onValueChange={(value) => setFormData({...formData, type: value})}
            style={{ backgroundColor: 'white' }}
          >
            <Picker.Item label="Group Class" value="group" />
            <Picker.Item label="Individual Training" value="individual" />
          </Picker>
        </View>

        {/* Timing Information */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Timing</Text>
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-800 font-medium mb-1">Date & Time*</Text>
          <TouchableOpacity 
            className="border border-gray-200 rounded-lg p-3 mb-4"
            onPress={() => {
              setDatePickerMode('date');
              setShowDatePicker(true);
            }}
          >
            <Text>{formData.dateTime.toLocaleString()}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={formData.dateTime}
              mode={datePickerMode}
              display="default"
              onChange={(event, selectedDate) => {
                if (datePickerMode === 'date') {
                  setDatePickerMode('time');
                  if (selectedDate) {
                    setFormData({...formData, dateTime: selectedDate});
                  }
                  return;
                }
                handleDateTimeChange(event, selectedDate);
              }}
            />
          )}

          <Text className="text-gray-800 font-medium mb-1">Duration (minutes)*</Text>
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-4"
            placeholder="60"
            keyboardType="numeric"
            value={formData.duration}
            onChangeText={(text) => setFormData({...formData, duration: text})}
          />

          {formData.type === 'group' && (
            <>
              <Text className="text-gray-800 font-medium mb-1">Max Participants*</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 mb-4"
                placeholder="10"
                keyboardType="numeric"
                value={formData.maxParticipants}
                onChangeText={(text) => setFormData({...formData, maxParticipants: text})}
              />
            </>
          )}
        </View>

        {/* Session Details */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Session Details</Text>
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-800 font-medium mb-1">Difficulty Level*</Text>
          <Picker
            selectedValue={formData.difficulty}
            onValueChange={(value) => setFormData({...formData, difficulty: value})}
            style={{ backgroundColor: 'white' }}
          >
            <Picker.Item label="Beginner" value="beginner" />
            <Picker.Item label="Intermediate" value="intermediate" />
            <Picker.Item label="Advanced" value="advanced" />
          </Picker>
        </View>

        {/* Recurring Session */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Recurrence</Text>
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 font-medium">Recurring Session</Text>
            <Switch
              value={formData.isRecurring}
              onValueChange={(value) => setFormData({...formData, isRecurring: value})}
              trackColor={{ false: '#767577', true: '#f97316' }}
            />
          </View>

          {formData.isRecurring && (
            <>
              <Text className="text-gray-800 font-medium mb-1">Recurrence Pattern</Text>
              <Picker
                selectedValue={formData.recurrencePattern}
                onValueChange={(value) => setFormData({...formData, recurrencePattern: value})}
                style={{ backgroundColor: 'white' }}
              >
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Bi-Weekly" value="biweekly" />
                <Picker.Item label="Monthly" value="monthly" />
              </Picker>

              <Text className="text-gray-800 font-medium mb-1 mt-4">Recurrence End Date</Text>
              <TouchableOpacity 
                className="border border-gray-200 rounded-lg p-3 mb-4"
                onPress={() => setShowRecurrenceEndPicker(true)}
              >
                <Text>{formData.recurrenceEndDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              
              {showRecurrenceEndPicker && (
                <DateTimePicker
                  value={formData.recurrenceEndDate}
                  mode="date"
                  display="default"
                  onChange={handleRecurrenceEndDateChange}
                />
              )}
            </>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-orange-400 rounded-xl p-4 mt-2"
          onPress={handleSubmit}
          disabled={loading || uploading}
        >
          <Text className="text-white font-bold text-center">
            {loading ? 'Submitting...' : uploading ? 'Uploading Image...' : 'Submit for Approval'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}