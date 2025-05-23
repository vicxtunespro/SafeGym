import SessionCard from '@/components/SessionCard';
import { sessionManager } from '@/services/resourceManager';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function UpcomingSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Get all sessions
        const allSessions = await sessionManager.getAll();
        console.log('Raw sessions from database:', allSessions);
        
        // Sort sessions by date
        const sortedSessions = allSessions
          .sort((a, b) => {
            try {
              return a.dateTime.toDate() - b.dateTime.toDate();
            } catch (e) {
              console.warn('Error sorting sessions:', e);
              return 0;
            }
          })
          .slice(0, 5); // Get only the first 5

        console.log('Sorted sessions:', sortedSessions);
        setSessions(sortedSessions);
        setError(null);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        if (error.message.includes('requires an index')) {
          setError('Please wait while we set up the database. This may take a few minutes.');
        } else {
          setError('Failed to load sessions');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-gray-800">Upcoming Classes</Text>
        </View>
        <View className="p-4">
          <Text className="text-gray-500">Loading sessions...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-gray-800">Upcoming Classes</Text>
        </View>
        <View className="p-4">
          <Text className="text-orange-500">{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-gray-800">Upcoming Classes</Text>
        <Link href="/client/sessions" asChild>
          <TouchableOpacity>
            <Text className="text-orange-500 font-medium">See all</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <FlatList
        data={sessions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        renderItem={({ item }) => {
          if (!item || !item.id || !item.title || !item.dateTime) {
            console.warn('Invalid session item:', item);
            return null;
          }
          return <SessionCard session={item} />;
        }}
        ListEmptyComponent={
          <View className="p-4">
            <Text className="text-gray-500">No sessions available</Text>
          </View>
        }
      />
    </View>
  );
}