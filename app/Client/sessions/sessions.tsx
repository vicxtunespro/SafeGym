import SessionCard from '@/components/SessionCard';
import { db } from '@/firebase/firebase';
import { collection, limit, onSnapshot, query, Timestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

interface Session {
  id: string;
  title: string;
  dateTime: Timestamp;
  description?: string;
  coverPhotoUrl?: string | null;
  participants: string[];
  maxParticipants: number;
  difficulty: string;
  duration: number;
  isRecurring: boolean;
}

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initializing session fetch...');
    
    const q = query(
      collection(db, 'sessions'),
      where('status', '==', 'approved'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log(`Received ${snapshot.size} documents`);
        
        if (snapshot.empty) {
          console.warn('No documents matched the query');
          setError('No approved sessions found');
          setSessions([]);
          setLoading(false);
          return;
        }

        const sessionsData: Session[] = [];
        
        snapshot.forEach((doc) => {
          try {
            const data = doc.data();
            console.log(`Processing document ${doc.id}:`, data);
            
            // Ensure all required fields are present
            if (!data.title || !data.dateTime) {
              console.warn(`Document ${doc.id} missing required fields:`, {
                hasTitle: !!data.title,
                hasDateTime: !!data.dateTime
              });
              return; // Skip this document
            }

            sessionsData.push({
              id: doc.id,
              title: data.title,
              dateTime: data.dateTime, // Keep as Firestore Timestamp
              description: data.description || '',
              coverPhotoUrl: data.coverPhotoUrl || data.coverPhoto || null,
              participants: Array.isArray(data.participants) ? data.participants : [],
              maxParticipants: parseInt(data.maxParticipants) || 0,
              difficulty: data.difficulty || 'beginner',
              duration: parseInt(data.duration) || 60,
              isRecurring: Boolean(data.isRecurring)
            });
          } catch (e) {
            console.error(`Error processing document ${doc.id}:`, e);
          }
        });

        console.log('Successfully processed sessions:', sessionsData);
        setSessions(sessionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        setError(`Failed to load sessions: ${error.message}`);
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up session listener');
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(item) => item?.id || Math.random().toString()}
      renderItem={({ item }) => {
        if (!item || !item.id || !item.title || !item.dateTime) {
          console.warn('Invalid session item:', item);
          return null;
        }
        return <SessionCard session={item} />;
      }}
      ListEmptyComponent={
        <View style={{ padding: 20 }}>
          <Text>No sessions available</Text>
        </View>
      }
      contentContainerStyle={{ padding: 16 }}
    />
  );
}