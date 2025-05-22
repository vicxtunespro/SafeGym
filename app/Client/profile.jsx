// import { getAuth, signOut } from 'firebase/auth';
// import { getDoc } from 'firebase/firestore';
// import { useEffect, useState } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { Avatar, Button, Divider, Text } from 'react-native-paper';

// const ProfileScreen = ({ route, navigation }) => {
//   const { user } = route.params;
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         // const docRef = doc(db, 'users', user.uid); // or 'clients', depending on your collection
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           setUserData(docSnap.data());
//         } else {
//           console.warn('No user data found for this ID.');
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };

//     if (user?.uid) {
//       fetchUserData();
//     }
//   }, [user]);

//   const handleLogout = async () => {
//     try {
//       const auth = getAuth();
//       await signOut(auth);
//       navigation.replace('SignIn');
//     } catch (error) {
//       console.error('Logout failed:', error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.profileHeader}>
//         <Avatar.Image
//           size={100}
//           source={{
//             uri: userData?.imageUrl || user?.photoURL || 'https://www.gravatar.com/avatar?d=mp',
//           }}
//         />
//         <Text style={styles.username}>{userData?.firstName || user?.displayName || 'No Username'}</Text>
//         <Text style={styles.email}>{user?.email}</Text>
//       </View>

//       <Divider style={{ marginVertical: 20 }} />

//       <View style={styles.infoBox}>
//         <Text style={styles.infoLabel}>Phone Number</Text>
//         <Text style={styles.infoValue}>{userData?.phone || 'Not Provided'}</Text>

//         <Text style={styles.infoLabel}>Membership</Text>
//         <Text style={styles.infoValue}>{userData?.membership || 'No Plan'}</Text>
//       </View>

//       <Button
//         mode="contained"
//         style={styles.editButton}
//         onPress={() => navigation.navigate('EditProfile', { user: { ...user, ...userData } })}
//       >
//         Edit Profile
//       </Button>

//       <Button
//         mode="outlined"
//         style={styles.logoutButton}
//         onPress={handleLogout}
//       >
//         Log Out
//       </Button>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 24, backgroundColor: '#fff' },
//   profileHeader: { alignItems: 'center' },
//   username: { fontSize: 22, fontWeight: 'bold', marginTop: 12 },
//   email: { color: '#666', marginBottom: 10 },
//   infoBox: { marginTop: 10, padding: 10 },
//   infoLabel: { fontWeight: 'bold', color: '#333', marginTop: 10 },
//   infoValue: { fontSize: 16, color: '#555' },
//   editButton: { marginTop: 30, backgroundColor: '#000' },
//   logoutButton: { marginTop: 10, borderColor: '#000' },
// });

// export default ProfileScreen;
