import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

  import {
  doc,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';


import { auth, db } from '@/firebase/firebase';
import { userManager } from '@/services/resourceManager';
import { useAuthStore } from '@/stores/useAuthStore';
  
  // Listen to auth state changes and update Zustand store
  export function listenToAuthChanges() {
    const { setUser, clearUser } = useAuthStore.getState();
  
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await userManager.get(user.uid);
        setUser(userData);
      } else {
        clearUser();
      }
    });
  }
  
  // Login method
  export async function LoginWithEmail(email, password) {
    try {
      const userCredentials = await signInWithEmailAndPassword(auth, email, password);
      const User = userCredentials.user;
      const userData = await userManager.get(User.uid);
      // Sync with Zustand store
      useAuthStore.getState().setUser(userData, userData.role);
      console.log(useAuthStore.getState().role);
      return userData;
    } catch (error) {
      console.log('Login error:', error.message);
      throw new Error("Invaild creditials");
    }
  }
  
  // Logout method
  export async function Logout() {
    try {
      await signOut(auth);
      useAuthStore.getState().clearUser();
    } catch (error) {
      throw error;
    }
  }
  
   export async function signInWithGoogle(router, startLoading, stopLoading, setUser, setRole){
  
//       startLoading();
  
//       const googleProvider = new GoogleAuthProvider();
      
  
//       try {
//           const results = await signInWithPopup(auth, googleProvider);
//           const user = results.user;
  
//           // Check if user exits.
//           const userRef = doc(db, "users", user.uid);
//           const userSnap = await getDoc(userRef);
//           const userDetails = userSnap.data();
  
//           if (!userSnap.exists()){
//               await setDoc(userRef, {
//                   uid: user.uid,
//                   name: user.displayName || "Anonymous",
//                   email: user.email || "No Email",
//                   photoURL: user.photoURL || "/default-avatar.png",
//                   createdAt: serverTimestamp(),
//               });
//           }else{

//           }

//           return results.user;
   
//       } catch (error) {
//           console.log(error.message);
//           throw error;
//       } finally{
//           stopLoading();
//       }
   }


   export async function SignUpWithMoreInfo({ name, email, password, phone, role, gender, dateOfBirth }) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Set optional Auth profile display name
      await updateProfile(user, {
        displayName: name,
      });
  
      // Store extended user profile in Firestore
      const userDoc = {
        uid: user.uid,
        name,
        email,
        phone,
        role: role || 'user',
        gender,
        dateOfBirth,
        photoURL: user.photoURL || '/default-avatar.png',
        createdAt: serverTimestamp(),
      };
  
      await setDoc(doc(db, 'users', user.uid), userDoc);
  
      // Sync with Zustand store
      useAuthStore.getState().setUser({ ...userDoc, createdAt: Date.now() });
  
      return userDoc;
    } catch (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
  }

   export async function CreateUser({ email, pwd, username, phone }) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
      const user = userCredential.user;
  
      // Set optional Auth profile display name
      await updateProfile(user, {
        displayName: username,
      });
  
      // Store extended user profile in Firestore
      const userDoc = {
        uid: user.uid,
        username,
        email,
        phone,
        role: 'user',
        photoURL: user.photoURL || '/default-avatar.png',
        createdAt: serverTimestamp(),
      };
  
      await setDoc(doc(db, 'users', user.uid), userDoc);
  
      return userDoc;

    } catch (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
  }
  