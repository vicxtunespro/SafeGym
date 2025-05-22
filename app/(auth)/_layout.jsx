import { useAuthStore } from "@/stores/useAuthStore";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {

  const { user, role } = useAuthStore();

  useEffect(() => {
      const checkAuthAndRedirect = async () => {
        if (user) {
          // Redirect based on user role
          switch(role) {
            case 'client':
              return <Redirect href={'/Client/home'} />;
            case 'trainer':
              return <Redirect href={'/Client/home'} />;
            case 'admin':
              return <Redirect href={'/Client/home'} />;
            default:
              return <Redirect href={'/(auth)/roleSelection'} />;
          }
        }
      };
  
      checkAuthAndRedirect();
    }, [user]);

  return (
    <Stack>
        <Stack.Screen name="roleSelection" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
    </Stack>
  )
}
