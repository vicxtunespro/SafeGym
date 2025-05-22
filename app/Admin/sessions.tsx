import { useAdminStore } from '@/stores/useAdminStore';
import { useEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function SessionsManagement() {
  const { sessions, fetchSessions, approveSession, rejectSession } = useAdminStore();
  
  useEffect(() => {
    fetchSessions();
  }, []);
  
  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Session Management</Text>
      
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white p-4 mb-3 rounded-lg shadow">
            <View className="flex-row justify-between">
              <Text className="font-bold">{item.title}</Text>
              <Text className={`px-2 rounded ${
                item.status === 'approved' ? 'bg-green-100 text-green-800' :
                item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </Text>
            </View>
            
            <Text className="text-gray-600 my-1">{item.description}</Text>
            <Text>Type: {item.type === 'group' ? 'Group' : 'Individual'}</Text>
            <Text>Trainer: {item.trainerId}</Text> {/* Would show trainer name in real app */}
            <Text>Date: {new Date(item.dateTime).toLocaleString()}</Text>
            <Text>Duration: {item.duration} mins</Text>
            
            {item.status === 'pending' && (
              <View className="flex-row justify-end mt-2">
                <TouchableOpacity 
                  className="bg-red-500 px-3 py-1 rounded mr-2"
                  onPress={() => rejectSession(item.id)}
                >
                  <Text className="text-white">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-green-500 px-3 py-1 rounded"
                  onPress={() => approveSession(item.id)}
                >
                  <Text className="text-white">Approve</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}