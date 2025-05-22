import { useAdminStore } from '@/stores/useAdminStore';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ORANGE = '#FF7A00'; // Brand orange
const GREY = '#F4F4F4';   // Light grey background
const DARK_GREY = '#333'; // Text color

interface TrainerFormProps {
  initialData?: Trainer | null;
  onClose: () => void;
}

export default function TrainerForm({ initialData, onClose }: TrainerFormProps) {
  const { addTrainer, updateTrainer } = useAdminStore();
  const [image, setImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone,
        password: initialData.password,
      });
      if (initialData.profilePhoto) {
        setImage(initialData.profilePhoto);
      }
    }
  }, [initialData]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const trainerData = {
      ...formData,
      profilePhoto: image || undefined,
    };

    try {
      if (initialData) {
        await updateTrainer(initialData.id, trainerData);
        Alert.alert('Success', 'Trainer updated successfully');
      } else {
        await addTrainer(trainerData);
        Alert.alert('Success', 'Trainer added successfully');
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save trainer');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {initialData ? 'Edit Trainer' : 'Add New Trainer'}
      </Text>

      {/* Profile Photo */}
      <View style={styles.photoContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
          {image ? (
            <Image 
              source={{ uri: image }} 
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.firstName}
          onChangeText={(text) => handleChange('firstName', text)}
          placeholder="Enter first name"
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.lastName}
          onChangeText={(text) => handleChange('lastName', text)}
          placeholder="Enter last name"
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          placeholderTextColor="#aaa"
        />
      </View>

      {!initialData && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            placeholder="Enter password"
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>
      )}

      {/* Form Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSubmit}
        >
          <Text style={styles.saveButtonText}>
            {initialData ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GREY,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 24,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: DARK_GREY,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButton: {
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ORANGE,
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
  },
  profilePhoto: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  photoPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: '#bbb',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK_GREY,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: DARK_GREY,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: ORANGE,
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: ORANGE,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: ORANGE,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    elevation: 1,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});