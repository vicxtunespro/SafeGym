import TrainerForm from '@/components/TrainForm';
import { useAdminStore } from '@/stores/useAdminStore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';


export default function TrainersManagement() {
  const { trainers, fetchTrainers, deleteTrainer } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  
  useEffect(() => {
    fetchTrainers();
  }, []);
 
  return (
    <ScrollView className="flex-1 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-xl font-bold">Trainer Management</Text>
          <Text className="text-xs text-gray-500 font-light">Manage all trainer's information here.</Text>
        </View>
        <TouchableOpacity 
          className="bg-orange-400 px-4 py-2 rounded"
          onPress={() => {
            setEditingTrainer(null);
            setShowForm(true);
          }}
        >
          <Text className="text-white text-xs">Add Trainer</Text>
        </TouchableOpacity>
      </View>
      
      {showForm && (
        <TrainerForm 
          initialData={editingTrainer}
          onClose={() => {
            setShowForm(false);
            fetchTrainers();
          }}
        />
      )}
      
      {
        trainers.map(item => (
          <View key={item.id} className="bg-white p-4 mb-3 rounded-lg shadow">
            <View className="flex-row items-center">
              {item.profilePhoto ? (
                <Image 
                  source={{ uri: item.profilePhoto }}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <View className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                  <Text className="text-gray-500 text-xl">
                    {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                  </Text>
                </View>
              )}
              
              <View className="flex-1">
                <Text className="font-bold text-sm">
                  {item.firstName} {item.lastName}
                </Text>
                <Text className="text-gray-600 text-xs">{item.email}</Text>
                <Text className="text-gray-600 text-xs">{item.phone}</Text>
              </View>
              
              <View className="flex-row">
                <TouchableOpacity 
                  className="bg-yellow-500 p-1 rounded mr-1"
                  onPress={() => {
                    setEditingTrainer(item);
                    setShowForm(true);
                  }}
                >
                  <Text className="text-white text-xs">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-red-500 p-1 rounded"
                  onPress={() => deleteTrainer(item.id)}
                >
                  <Text className="text-white text-xs">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}