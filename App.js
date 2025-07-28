import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/Login";
import SignupScreen from "./screens/Signup";
import HomeScreen from "./screens/Home";
import FavoritosScreen from "./screens/Favoritos";
import PerfilScreen from "./screens/Perfil";
import EventDetails from "./screens/EventDetails";
import EditarEvento from "./screens/EditarEvento";

import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen
  name="Eventos"
  component={HomeScreen}
  options={{ title: "Eventos", headerStyle: { backgroundColor: "#5e17eb" }, headerTintColor: "#FFF", headerTitleAlign: "center" }}
/>
          <Stack.Screen name="Favoritos" component={FavoritosScreen}
          options={{ title: "Favoritos", headerStyle: { backgroundColor: "#5e17eb" }, headerTintColor: "#FFF", headerTitleAlign: "center" }}
           />
          <Stack.Screen name="Perfil" component={PerfilScreen}
          options={{ title: "Perfil", headerStyle: { backgroundColor: "#5e17eb" }, headerTintColor: "#FFF", headerTitleAlign: "center" }}
           />
          <Stack.Screen name="EventDetails" component={EventDetails} 
          options={{ title: "Detalhes",headerStyle: { backgroundColor: "#5e17eb" }, headerTintColor: "#FFF", headerTitleAlign: "center" }} />
          <Stack.Screen name="EditarEvento" component={EditarEvento}
    options={{ title: "Editar Evento" }}
  />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
  name="Login"
  component={LoginScreen}
  options={{
    title: "Login",
    headerStyle: { backgroundColor: "#5e17eb" },
    headerTintColor: "#FFF", // cor do texto e ícones
    headerTitleAlign: "center", // opcional: centraliza o título
  }}
/>
          <Stack.Screen name="Signup" component={SignupScreen} options={{
    title: "Registe-se",
    headerStyle: { backgroundColor: "#5e17eb" },
    headerTintColor: "#FFF", // cor do texto e ícones
    headerTitleAlign: "center", // opcional: centraliza o título
  }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

