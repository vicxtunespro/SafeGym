import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function SessionCard({ session }) {
  // Debug logging
  useEffect(() => {
    if (!session) {
      console.error('[SESSION CARD] Rendered without session prop');
    } else if (!session.id || !session.title) {
      console.warn('[SESSION CARD] Invalid session data:', {
        id: session.id,
        title: session.title,
        dateTime: session.dateTime
      });
    }
  }, [session]);

  // Strict validation
  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>[Error] Missing entire session data</Text>
      </View>
    );
  }

  if (!session.id || !session.title || !session.dateTime) {
    return (
      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>
          [Invalid Data] Missing: {!session.id ? 'ID' : !session.title ? 'Title' : 'Date'}
        </Text>
        <Text style={styles.debugText}>
          {JSON.stringify(session, null, 2)}
        </Text>
      </View>
    );
  }

  // Safely parse date
  let sessionDate;
  try {
    sessionDate = session.dateTime.toDate();
  } catch (_) {
    console.error('[SESSION CARD] Invalid date:', session.dateTime);
    sessionDate = new Date();
  }

  return (
    <Link href={`/Client/sessions/${session.id}`} asChild>
      <TouchableOpacity style={styles.cardContainer}>
        {session.coverPhotoUrl && (
          <Image 
            source={{ uri: session.coverPhotoUrl }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{session.title}</Text>
          <Text style={styles.date}>
            {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString()}
          </Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{session.duration} min</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="account-group-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {session.participants.length}/{session.maxParticipants}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="signal" size={16} color="#666" />
              <Text style={styles.detailText}>{session.difficulty}</Text>
            </View>
          </View>
          {session.description && (
            <Text style={styles.description} numberOfLines={2}>
              {session.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = {
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImage: {
    width: '100%',
    height: 150,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef9a9a'
  },
  warningContainer: {
    backgroundColor: '#fff8e1',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcc80'
  },
  errorText: {
    color: '#c62828',
    fontWeight: 'bold'
  },
  warningText: {
    color: '#ff8f00',
    fontWeight: 'bold'
  },
  debugText: {
    fontSize: 10,
    marginTop: 8,
    color: '#666'
  }
};