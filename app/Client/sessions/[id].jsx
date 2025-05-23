import { useAuth } from '@/contexts/AuthContext';
import { sessionService } from '@/services/sessionsService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function SessionDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const sessionData = await sessionService.getSession(id);
        console.log('Fetched session:', sessionData);
        
        if (!sessionData) {
          throw new Error('Session not found');
        }

        setSession({
          ...sessionData,
          dateTime: sessionData.dateTime instanceof Timestamp 
            ? sessionData.dateTime.toDate() 
            : new Date(sessionData.dateTime || Date.now())
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleBookSession = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to book a session',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/signin') }
        ]
      );
      return;
    }

    try {
      setBooking(true);
      await sessionService.bookSession(id, user.uid);
      
      // Refresh session data
      const updatedSession = await sessionService.getSession(id);
      setSession({
        ...updatedSession,
        dateTime: updatedSession.dateTime instanceof Timestamp 
          ? updatedSession.dateTime.toDate() 
          : new Date(updatedSession.dateTime || Date.now())
      });

      Toast.show({
        type: 'success',
        text1: 'Booking Successful',
        text2: 'You have been booked for this session',
        position: 'top',
        visibilityTime: 4000
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Booking Failed',
        text2: error.message,
        position: 'top',
        visibilityTime: 4000
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center p-4">
        <Text className="text-red-500 text-lg font-bold mb-2">Error Loading Session</Text>
        <Text className="text-red-500 text-center">{error || 'Session data not available'}</Text>
      </SafeAreaView>
    );
  }

  const sessionDate = session.dateTime;
  const timeString = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = sessionDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const maxParticipants = session.maxParticipants || 0;
  const participantCount = Array.isArray(session.participants) ? session.participants.length : 0;
  const availableSlots = maxParticipants - participantCount;
  const isBooked = user && session.participants?.includes(user.uid);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        <Image 
          source={{ uri: session.coverPhotoUrl || session.coverPhoto || 'https://via.placeholder.com/300' }}
          style={{ width: '100%', height: 250 }}
          resizeMode="cover"
          defaultSource={require('@/assets/images/logo2.png')}
        />
        
        <View className="p-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">{session.title}</Text>
          <Text className="text-gray-800 text-lg mb-4">{session.description}</Text>
          
          <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="clock-outline" size={20} color="#6b7280" />
              <Text className="text-gray-800 font-medium ml-2">
                {timeString} • {session.duration || '?'} minutes
              </Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="calendar" size={20} color="#6b7280" />
              <Text className="text-gray-800 font-medium ml-2">{dateString}</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="account-group" size={20} color="#6b7280" />
              <Text className="text-gray-800 font-medium ml-2">
                {availableSlots} of {maxParticipants} slots available
              </Text>
            </View>
            
            {session.trainerName && (
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="account" size={20} color="#6b7280" />
                <Text className="text-gray-800 font-medium ml-2">Trainer: {session.trainerName}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            className={`rounded-xl p-4 shadow-sm mb-8 ${isBooked ? 'bg-gray-400' : 'bg-orange-500'}`}
            onPress={handleBookSession}
            disabled={isBooked || booking || availableSlots <= 0}
          >
            {booking ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-center text-lg">
                {isBooked ? 'Already Booked' : availableSlots <= 0 ? 'Session Full' : 'Book Appointment'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}