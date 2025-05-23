import { db } from '@/firebase/firebase';
import { format } from 'date-fns';
import { Link } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientHome() {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [featuredTrainers, setFeaturedTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time sessions listener
  useEffect(() => {
    const q = query(
      collection(db, 'sessions'),
      where('status', '==', 'approved'),
      where('dateTime', '>', new Date()),
      orderBy('dateTime')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateTime: doc.data().dateTime.toDate()
      }));
      setUpcomingSessions(sessions);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Real-time trainers listener
  useEffect(() => {
    

    const unsubscribe = onSnapshot(collection(db, 'trainers'), (snapshot) => {
      const trainers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeaturedTrainers(trainers.slice(0, 4));
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-800">Find Your</Text>
          <Text className="text-3xl font-bold text-orange-500">Perfect Session</Text>
        </View>

        {/* Upcoming Sessions */}
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
            horizontal
            data={upcomingSessions.slice(0, 3)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Link href={`/client/sessions/${item.id}`} asChild>
                <TouchableOpacity className="bg-white rounded-xl p-4 mr-4 w-64 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-bold text-gray-800 flex-1">{item.title}</Text>
                    <View className="bg-orange-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-orange-800">{item.type}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>{item.description}</Text>
                  <Text className="text-orange-500 font-medium mb-1">
                    {format(item.dateTime, 'EEE, MMM d • h:mm a')}
                  </Text>
                  <Text className="text-gray-500 text-sm">{item.duration} minutes</Text>
                </TouchableOpacity>
              </Link>
            )}
            ListEmptyComponent={
              <View className="bg-white rounded-xl p-6 w-64 items-center">
                <Text className="text-gray-500">No upcoming sessions</Text>
              </View>
            }
          />
        </View>

        {/* Featured Trainers */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">Top Trainers</Text>
            <Link href="/client/trainers" asChild>
              <TouchableOpacity>
                <Text className="text-orange-500 font-medium">View all</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <FlatList
            horizontal
            data={featuredTrainers}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Link href={`/client/trainers/${item.id}`} asChild>
                <TouchableOpacity className="bg-white rounded-xl p-4 mr-4 w-48 items-center shadow-sm">
                  <Image 
                    source={{ uri: item.profilePhoto }}
                    className="h-24 w-24 rounded-full mb-2"
                    resizeMode="cover"
                  />
                  <Text className="font-bold text-gray-800 text-center">{item.firstName} {item.lastName}</Text>
                  <View className="flex-row mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} className="text-sm">
                        {star <= (item.rating || 0) ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                  <Text className="text-gray-500 text-sm mt-1">{item.specialty}</Text>
                </TouchableOpacity>
              </Link>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}