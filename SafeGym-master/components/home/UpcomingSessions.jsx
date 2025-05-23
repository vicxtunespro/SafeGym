import SessionCard from '@/components/SessionCard';
import { sessionManager } from '@/services/resourceManager';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

sessionManager

export default function UpcomingSessions() {

  const [upcomingSessions, setUpcomingSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessions = await sessionManager.getAll();
        setUpcomingSessions(sessions.slice(0, 5)); // Get the first 5 sessions
      } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
      }
    };

    fetchSessions();
  })

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
        data={upcomingSessions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <SessionCard
              key={item?.id} 
              id={item?.id}
              title={item?.title}
              trainer={item?.trainerID}
              time={item?.startTime}
              day={item?.schedule}
              imageUrl={item?.coverPhotoUrl}
              type={item?.difficulty}
            />
        )}
      />
    </View>
  );
}