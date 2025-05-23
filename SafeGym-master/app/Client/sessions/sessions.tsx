import SessionCard from '@/components/SessionCard'; // Adjust import path as needed
import { db } from '@/firebase/firebase';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionsScreen() {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'sessions'),
      where('status', '==', 'approved'),
      where('dateTime', '>', new Date()),
      orderBy('dateTime')
    );

    const unsubscribe = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateTime: doc.data().dateTime.toDate(),
        // Ensure these fields exist in your Firestore documents
        coverPhotoUrl: doc.data().coverPhotoUrl || '',
        participants: doc.data().participants || [],
        maxParticipants: doc.data().maxParticipants || '0',
        difficulty: doc.data().difficulty || 'beginner',
        isRecurring: doc.data().isRecurring || false
      }));
      setSessions(sessionsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredSessions = sessions.filter(session =>
    session?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session?.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4 grid grid-cols-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">Available</Text>
          <Text className="text-2xl font-bold text-orange-500">Sessions</Text>
        </View>

        {/* Search */}
        <TextInput
          className="bg-white rounded-xl p-3 mb-6 shadow-sm"
          placeholder="Search sessions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : (
          <FlatList
            data={filteredSessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SessionCard session={item} />
            )}
            ListEmptyComponent={
              <View className="bg-white rounded-xl p-6 items-center">
                <Text className="text-gray-500">No sessions found</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}