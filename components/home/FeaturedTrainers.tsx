import { Link } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

const featuredTrainers = [
  {
    id: '1',
    name: 'Coach Alex',
    specialty: 'Yoga',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Coach Ricky',
    specialty: 'HIIT',
    rating: 4.6
  }
];

export default function FeaturedTrainers() {
  return (
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
        data={featuredTrainers}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/client/trainers/${item.id}`} asChild>
            <TouchableOpacity className="bg-white rounded-xl p-4 mr-4 w-48 items-center shadow-sm">
              <View className="bg-gray-300 w-20 h-20 rounded-full mb-3" />
              <Text className="font-bold text-gray-800 text-center">{item.name}</Text>
              <View className="flex-row mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} className="text-sm">
                    {star <= Math.floor(item.rating) ? '★' : '☆'}
                  </Text>
                ))}
              </View>
              <Text className="text-gray-500 text-sm mt-1">{item.specialty}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}