import { sessionManager, trainerManager } from '@/services/resourceManager';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

trainerManager
sessionManager

export default function SessionDetail() {
  const { id } = useLocalSearchParams();
  const [trainer, setTrainer] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() =>{
    // Fetch trainer details from Firebase using the id
    const fetchSessionDetails = async () => {
      try {
        // Fetch session details using the session ID
        const sessionDetails = await sessionManager.get(id);
        console.log(sessionDetails);
        setSession(sessionDetails);
        // Fetch trainer details using the trainer ID from session details
      } catch (error) {
        console.error('Error fetching session details:', error);
      }
    };
    const fetchTrainerDetails = async () => {
      try {
        // Fetch session details using the session ID
        const trainerDetails = await trainerManager.getAll();
        console.log(trainerDetails);
        setTrainer(trainerDetails);
        // Fetch trainer details using the trainer ID from session details
      } catch (error) {
        console.error('Error fetching session details:', error);
      }
    };

    fetchSessionDetails();
    fetchTrainerDetails();
  }, [id]);
  
  
  // In a real app, this would come from Firebase
  

  const otherSessions = [
    {
      id: '2',
      title: 'Aerobics',
      trainer: 'Coach Ricky',
      day: 'Every Friday'
    },
    {
      id: '3',
      title: 'Gymnastics',
      trainer: 'Coach Ricky',
      day: 'Every Tuesday'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        {/* Session Header */}
        {/* <LinearGradient
          colors={['#f97316', '#fb923c']}
          className="p-6 rounded-b-3xl shadow-sm"
        > */}
        <Image 
          source={{
            uri: session?.imageUrl // Placeholder image
          }}
          style={{ width: '100%', height: 250 }}
          resizeMode="cover"
        />
          

        {/* Session Details */}
        <View className="p-6">
          <Text className="text-gray-800 text-lg mb-4">{session?.description}</Text>
          
          <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-500 w-48">Time:</Text>
              <Text className="text-gray-800 font-medium">{`${session?.startTime} - ${session?.endTime}`}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 w-48">Day:</Text>
              <Text className="text-gray-800 font-medium">{session?.schedule}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 w-48">Slots Available:</Text>
              <Text className="text-gray-800 font-medium">{session?.slots}</Text>
            </View>
          </View>

          {/* Book Button */}
          <TouchableOpacity className="bg-orange-400 rounded-xl p-4 shadow-sm mb-8">
            <Text className="text-white font-bold text-center text-lg">Book Appointment</Text>
          </TouchableOpacity>

          {/* More from Coach */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-gray-800 mb-3">More from {trainer?.trainerID}</Text>
            
            {otherSessions.map((item) => (
              <TouchableOpacity 
                key={item.id}
                className="bg-white flex flex-row gap-4 rounded-xl p-4 mb-3 shadow-sm"
              >
                <Image 
                  source={{ uri: session?.imageUrl }} // Placeholder image
                  style={{ width: 100, height: 100 }}
                  resizeMode="cover"
                />
                <View>
                  <Text className="font-bold text-gray-800">{item.title}</Text>
                  <Text className="text-gray-600 text-sm mt-1">By {item.trainer}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{item.day}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{session?.startTime} - {session?.endTime}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}