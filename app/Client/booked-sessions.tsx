import { sessionService } from '@/services/sessionsService';
import { useAuthStore } from '@/stores/useAuthStore';
import { Session } from '@/types/session';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function BookedSessions() {
  const { user, isLoggedIn } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  console.log('[BookedSessions] Component rendered:', {
    hasUser: !!user,
    userId: user?.uid,
    isLoggedIn,
    loading,
    sessionsCount: sessions.length
  });

  const fetchBookedSessions = async () => {
    if (!user) {
      console.log('[BookedSessions] No user found, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('[BookedSessions] Fetching sessions for user:', user.uid);
      const fetchedSessions = await sessionService.getSessionsByParticipant(user.uid);
      console.log('[BookedSessions] Fetched sessions:', {
        count: fetchedSessions.length,
        sessions: fetchedSessions.map((s: Session) => ({
          id: s.id,
          title: s.title,
          dateTime: s.dateTime,
          participants: s.participants?.length || 0,
          bookedParticipants: s.bookedParticipants
        }))
      });

      // Sort sessions by date
      const sortedSessions = fetchedSessions.sort((a: Session, b: Session) => {
        const dateA = a.dateTime instanceof Date ? a.dateTime : a.dateTime.toDate();
        const dateB = b.dateTime instanceof Date ? b.dateTime : b.dateTime.toDate();
        return dateA.getTime() - dateB.getTime();
      });

      setSessions(sortedSessions);
      setError(null);
    } catch (err) {
      console.error('[BookedSessions] Error fetching sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[BookedSessions] useEffect triggered:', {
      hasUser: !!user,
      isLoggedIn,
      loading
    });

    if (user && isLoggedIn) {
      // Add a small delay to ensure loading state is visible
      const timer = setTimeout(() => {
        fetchBookedSessions();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [user, isLoggedIn]);

  const SessionDetailsModal = ({ session, onClose }: { session: Session | null; onClose: () => void }) => {
    if (!session) return null;
    
    const sessionDate = session.dateTime instanceof Date ? session.dateTime : session.dateTime.toDate();
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!session}
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 rounded-2xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-800">{session.title}</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="calendar" size={20} color="#f59e0b" />
                <Text className="ml-2 text-gray-700">
                  {sessionDate.toLocaleDateString()}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="clock-outline" size={20} color="#f59e0b" />
                <Text className="ml-2 text-gray-700">
                  {sessionDate.toLocaleTimeString()}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="account-group" size={20} color="#f59e0b" />
                <Text className="ml-2 text-gray-700">
                  {session.participants?.length || 0} participants
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="information" size={20} color="#f59e0b" />
                <Text className="ml-2 text-gray-700">
                  Status: {session.status}
                </Text>
              </View>
              
              {session.description && (
                <View className="mt-4">
                  <Text className="text-gray-600">{session.description}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-yellow-50">
        <MaterialCommunityIcons name="account-lock" size={48} color="#f59e0b" />
        <Text className="text-lg font-semibold text-center mt-4 text-gray-800">
          Please log in to view your booked sessions
        </Text>
        <Link href="/(auth)/login" className="mt-4">
          <TouchableOpacity className="bg-yellow-500 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Go to Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-yellow-50">
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className="mt-4 text-gray-700">Loading your sessions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-yellow-50">
        <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-lg font-semibold text-center mt-4 text-red-500">
          {error}
        </Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-yellow-50">
        <MaterialCommunityIcons name="calendar-blank" size={48} color="#f59e0b" />
        <Text className="text-lg font-semibold text-center mt-4 text-gray-800">
          You haven&apos;t booked any sessions yet
        </Text>
        <Link href="../sessions" className="mt-4">
          <TouchableOpacity className="bg-yellow-500 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Browse Available Sessions</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-yellow-50">
      <View className="p-6 pt-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-3">My Booked Sessions</Text>
          <View className="h-1.5 w-24 bg-yellow-500 rounded-full" />
        </View>
        {sessions.map((session) => {
          const sessionDate = session.dateTime instanceof Date ? session.dateTime : session.dateTime.toDate();
          return (
            <View
              key={session.id}
              className="bg-white rounded-xl p-5 mb-4 shadow-md border border-yellow-100"
            >
              <Text className="text-xl font-semibold mb-3 text-gray-800">{session.title}</Text>
              <Text className="text-gray-600 mb-2">
                {sessionDate.toLocaleDateString()} at{' '}
                {sessionDate.toLocaleTimeString()}
              </Text>
              <Text className="text-gray-600 mb-4">
                {session.participants?.length || 0} participants
              </Text>
              <TouchableOpacity 
                onPress={() => setSelectedSession(session)}
                className="bg-yellow-500 px-5 py-3 rounded-lg self-end"
              >
                <Text className="text-white font-semibold">View Details</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <SessionDetailsModal 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)} 
      />
    </ScrollView>
  );
} 