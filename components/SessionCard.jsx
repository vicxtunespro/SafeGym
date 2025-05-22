import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SessionCard({ session }) {
  // Format the date and time
  const sessionDate = new Date(session?.dateTime);
  const timeString = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dayString = sessionDate.toLocaleDateString([], { weekday: 'long' });
  
  // Calculate available slots
  const availableSlots = parseInt(session?.maxParticipants) - (session?.participants?.length || 0);
  const isFull = availableSlots <= 0;

  return (
    <Link href={`/Client/sessions/${session?.id}`} asChild>
      <TouchableOpacity className="bg-white rounded-xl p-0 mr-4 w-64 shadow-sm overflow-hidden">
        {/* Session Image */}
        <Image
          source={{ uri: session?.coverPhotoUrl }}
          style={{ width: '100%', height: 150, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
          resizeMode="cover"
          defaultSource={require('@/assets/images/logo2.png')}
        />
        
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="font-bold text-gray-800 flex-1" numberOfLines={1}>
              {session?.title}
            </Text>
            <View className={`px-2 py-1 rounded-full ml-2 ${isFull ? 'bg-red-100' : 'bg-orange-100'}`}>
              <Text className={`text-xs ${isFull ? 'text-red-800' : 'text-orange-800'} capitalize`}>
                {isFull ? 'Full' : `${availableSlots}/${session?.maxParticipants}`}
              </Text>
            </View>
          </View>
          
          <Text className="text-gray-600 text-sm mb-1" numberOfLines={2}>
            {session?.description}
          </Text>
          
          <View className="flex-row items-center mt-2 mb-1">
            <MaterialCommunityIcons name="clock-outline" size={14} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1">
              {session?.duration} mins • {session?.difficulty}
            </Text>
          </View>
          
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-orange-500 font-medium">{timeString}</Text>
            {session?.isRecurring ? (
              <Text className="text-gray-500 text-xs">Every {dayString}</Text>
            ) : (
              <Text className="text-gray-500 text-xs">
                {sessionDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  )
}

const styles = StyleSheet.create({})