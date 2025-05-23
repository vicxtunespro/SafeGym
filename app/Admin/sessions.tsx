import { useAdminStore } from '@/stores/useAdminStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function SessionsManagement() {
  const { sessions, fetchSessions, approveSession, rejectSession } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      await fetchSessions();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      Toast.show({
        type: 'error',
        text1: 'Error Loading Sessions',
        text2: err instanceof Error ? err.message : 'Failed to load sessions',
        position: 'top',
        visibilityTime: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sessionId: string) => {
    try {
      setProcessingAction(sessionId);
      await approveSession(sessionId);
      Toast.show({
        type: 'success',
        text1: 'Session Approved',
        text2: 'The session has been approved successfully',
        position: 'top',
        visibilityTime: 4000
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Approval Failed',
        text2: err instanceof Error ? err.message : 'Failed to approve session',
        position: 'top',
        visibilityTime: 4000
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (sessionId: string) => {
    Alert.prompt(
      'Reject Session',
      'Please provide a reason for rejection:',
      async (reason) => {
        if (reason) {
          try {
            setProcessingAction(sessionId);
            await rejectSession(sessionId);
            Toast.show({
              type: 'success',
              text1: 'Session Rejected',
              text2: 'The session has been rejected successfully',
              position: 'top',
              visibilityTime: 4000
            });
          } catch (err) {
            Toast.show({
              type: 'error',
              text1: 'Rejection Failed',
              text2: err instanceof Error ? err.message : 'Failed to reject session',
              position: 'top',
              visibilityTime: 4000
            });
          } finally {
            setProcessingAction(null);
          }
        }
      }
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center p-4">
        <Text className="text-red-500 text-lg font-bold mb-2">Error Loading Sessions</Text>
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity 
          className="bg-orange-500 px-4 py-2 rounded-lg mt-4"
          onPress={loadSessions}
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Session Management</Text>
        
        {sessions.length === 0 ? (
          <View className="bg-white rounded-xl p-6 shadow-sm">
            <Text className="text-gray-600 text-center">No sessions found</Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xl font-bold text-gray-800">{item.title}</Text>
                  <Text className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === 'approved' ? 'bg-green-100 text-green-800' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
                
                <Text className="text-gray-600 mb-2">{item.description}</Text>
                
                <View className="flex-row flex-wrap gap-2 mb-2">
                  <Text className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {item.type === 'group' ? 'Group Session' : 'Individual Session'}
                  </Text>
                  {item.maxParticipants && (
                    <Text className="bg-gray-100 px-2 py-1 rounded text-sm">
                      Max: {item.maxParticipants}
                    </Text>
                  )}
                  <Text className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {item.duration} mins
                  </Text>
                </View>
                
                <Text className="text-gray-600 mb-2">
                  Trainer ID: {item.trainerId}
                </Text>
                
                <Text className="text-gray-600 mb-4">
                  Date: {new Date(item.dateTime).toLocaleString()}
                </Text>
                
                {item.status === 'pending' && (
                  <View className="flex-row justify-end space-x-2">
                    <TouchableOpacity
                      className={`bg-red-500 px-4 py-2 rounded-lg ${processingAction === item.id ? 'opacity-50' : ''}`}
                      onPress={() => handleReject(item.id)}
                      disabled={processingAction === item.id}
                    >
                      <Text className="text-white font-bold">
                        {processingAction === item.id ? 'Processing...' : 'Reject'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`bg-green-500 px-4 py-2 rounded-lg ${processingAction === item.id ? 'opacity-50' : ''}`}
                      onPress={() => handleApprove(item.id)}
                      disabled={processingAction === item.id}
                    >
                      <Text className="text-white font-bold">
                        {processingAction === item.id ? 'Processing...' : 'Approve'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}