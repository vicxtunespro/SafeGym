import { Link } from 'expo-router';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

interface Session {
  id: string;
  title: string;
  trainer: string;
  description: string;
  time: string;
  day: string;
  type: string;
  image?: string; // Add image property
}

export default function SessionSection({ title, sessions }: { title: string; sessions: Session[] }) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-semibold text-gray-800 mb-4">{title}</Text>
      
      <FlatList
        data={sessions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/Client/sessions/${item.id}`} asChild>
            <TouchableOpacity className="bg-white rounded-xl p-0 mr-4 w-64 shadow-sm overflow-hidden">
              {/* Session Image */}
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require('@/assets/images/yoga.jpg')
                }
                style={{ width: '100%', height: 150, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                resizeMode="cover"
              />
              <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="font-bold text-gray-800 flex-1" numberOfLines={1}>{item.title}</Text>
                  <View className="bg-orange-100 px-2 py-1 rounded-full ml-2">
                    <Text className="text-xs text-orange-800 capitalize">{item.type}</Text>
                  </View>
                </View>
                <Text className="text-gray-600 text-sm mb-1" numberOfLines={1}>By {item.trainer}</Text>
                <View className={"flex-row items-center justify-between"}>
                  <Text className="text-orange-500 font-medium mb-1">{item.time}</Text>
                  <Text className="text-gray-500 text-xs">{item.day}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}