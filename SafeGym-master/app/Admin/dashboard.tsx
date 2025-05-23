import { db } from '@/firebase/firebase';
import { useAdminStore } from '@/stores/useAdminStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Link } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {

  const [ trainers, setTrainers ] = useState<Trainer[]>([]);
  const [ sessions, setSessions ] = useState<Session[]>([]);
  const [ upcomingSessions, setUpcomingSessions ] = useState<Session[]>([]);
  const { user, role } = useAuthStore();

  const { 
    reviews,
    loading,
    error,
    setupRealtimeListeners,
    getSessionMetrics 
  } = useAdminStore();
  
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const metrics = getSessionMetrics();

  console.log('User:', role);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLastUpdated(new Date().toLocaleTimeString());
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribeTrainers = onSnapshot(collection(db, 'trainers'), (snapShot) =>{
      const trainersData = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data
      }));
      setTrainers(trainersData);
    });

    const unsubscribeSessions = onSnapshot(collection(db, 'sessions'), (snapShot) => {
      const sessionsData = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data
      }))

      setSessions(sessionsData);
    });
    setLastUpdated(new Date().toLocaleTimeString());

    const upcomingSessionsData = sessions.filter(s => s.status === 'approved')
   
    setUpcomingSessions(upcomingSessionsData);
    console.log('Upcoming Sessions:', upcomingSessionsData);

    return () => {
      unsubscribeSessions();
      unsubscribeTrainers();
    };
  }, []);

  if (loading && trainers.length === 0 && sessions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Error loading data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gym Performance</Text>
          <Text style={styles.lastUpdated}>Updated: {lastUpdated}</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            label="Trainers" 
            value={trainers.length}
            icon="👨‍🏫"
          />
          <MetricCard 
            label="Sessions" 
            value={metrics.totalSessions}
            icon="📅"
          />
          <MetricCard 
            label="Avg Rating" 
            value={`${metrics.averageRating}/5`}
            icon="⭐"
          />
          <MetricCard 
            label="Upcoming" 
            value={metrics.upcomingSessions}
            icon="🕒"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <ActionButton 
            title="Manage Sessions"
            icon="📅"
            route="/Admin/sessions"
          />
          <ActionButton 
            title="Manage Trainers"
            icon="👨‍🏫"
            route="/Admin/trainers"
          />
        </View>

        {/* Upcoming Sessions */}
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        <UpcomingSessionsPreview sessions={sessions} />

        {/* Recent Reviews */}
        <Text style={styles.sectionTitle}>Recent Reviews</Text>
        <RecentReviewsPreview reviews={reviews} />
      </ScrollView>
    </SafeAreaView>
  );
}

const MetricCard = ({ label, value, icon }: { label: string; value: string | number; icon: string }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricIcon}>{icon}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const ActionButton = ({ title, icon, route }: { title: string; icon: string; route: string }) => (
  <Link href={route} asChild>
    <TouchableOpacity style={styles.actionButton}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  </Link>
);

const UpcomingSessionsPreview = ({ sessions }: { sessions: Session[] }) => {
  const upcoming = sessions
    .filter(s => new Date(s.dateTime) > new Date() && s.status === 'approved')
    .slice(0, 3);
    
  return (
    <View style={styles.sectionContainer}>
      {upcoming.length > 0 ? (
        upcoming.map(session => (
          <Link key={session.id} href={`/Admin/sessions/${session.id}`} asChild>
            <TouchableOpacity style={styles.sessionCard}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionTime}>
                {new Date(session.dateTime).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </TouchableOpacity>
          </Link>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming sessions</Text>
        </View>
      )}
      <Link href="/Admin/sessions" asChild>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all sessions →</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const RecentReviewsPreview = ({ reviews }: { reviews: Review[] }) => {
  const recent = reviews.slice(0, 3);
  
  return (
    <View style={styles.sectionContainer}>
      {recent.length > 0 ? (
        recent.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={styles.star}>
                  {star <= review.rating ? '★' : '☆'}
                </Text>
              ))}
            </View>
            <Text style={styles.reviewText} numberOfLines={2}>{review.comment}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      )}
      <Link href="/Admin/reviews" asChild>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all reviews →</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: 16,
    paddingBottom: 32
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryText: {
    color: 'white',
    fontWeight: '600'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  lastUpdated: {
    fontSize: 12,
    color: '#64748b'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  sectionContainer: {
    marginBottom: 24
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4
  },
  sessionTime: {
    fontSize: 14,
    color: '#64748b'
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8
  },
  star: {
    fontSize: 16,
    color: '#f59e0b',
    marginRight: 4
  },
  reviewText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b'
  },
  viewAll: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 8
  }
});