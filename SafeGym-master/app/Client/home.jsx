import FeaturedTrainers from '@/components/home/FeaturedTrainers';
import SessionSection from '@/components/home/SessionSection';
import UpcomingSessions from '@/components/home/UpcomingSessions';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../../components/AppBar';


export default function ClientHome() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppBar />
        <View className="p-4">
          {/* Hero Section */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-800">Find Your</Text>
            <Text className="text-3xl font-bold text-orange-500">Perfect Session</Text>
          </View>

          {/* Featured Sessions */}
          <SessionSection 
            title="Recommended For You"
            sessions={[
              {
                id: '1',
                title: 'Morning Yoga Flow',
                trainer: 'Coach Alex',
                description: 'Start your day with energizing yoga poses',
                time: '20:00 PM',
                day: 'Every Sunday',
                type: 'yoga'
              }
            ]}
          />

          {/* Upcoming Sessions */}
          <UpcomingSessions />

          {/* Featured Trainers */}
          <FeaturedTrainers />

          {/* Footer */}
          <View className="mt-8 mb-4 items-center">
            <Text className="text-gray-500">@2025 SAFEGYM</Text>
            <Text className="text-gray-500">Located in Nakawa Opposite Total Energies</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}