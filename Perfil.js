import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { database } from "../firebaseConfig";

export default function Perfil({ navigation }) {
  const { user, logout } = useAuth();
  const [participatingEvents, setParticipatingEvents] = useState([]);

  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
      return;
    }

    const unsubscribe = database
      .collection("events")
      .where("participants", "array-contains", user.uid)
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParticipatingEvents(data);
      });

    return () => unsubscribe();
  }, [user, navigation]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed128d" />
        <Text style={{ marginTop: 12, color: "#FFF" }}>Carregando perfil...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            console.error("Erro ao deslogar:", err);
            Alert.alert("Erro ao sair da conta.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("EventDetails", { event: item })}
    >
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>
            {new Date(item.datetime.toDate()).toLocaleDateString("pt-PT")} às{" "}
            {new Date(item.datetime.toDate()).toLocaleTimeString("pt-PT", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
    
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.heading}>👤 Perfil</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>UID:</Text>
        <Text style={styles.value}>{user.uid}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Sair</Text>
        </TouchableOpacity>

        <Text style={styles.subheading}>🎟 Eventos que você participa:</Text>

        {participatingEvents.length === 0 ? (
          <Text style={styles.empty}>
            Você ainda não está participando de eventos.
          </Text>
        ) : (
          <FlatList
            data={participatingEvents}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
          />
        )}
      </ScrollView>

      {/* ✅ Barra fixa fora do ScrollView */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate("Eventos")}>
          <Text style={styles.iconText}>🏠{"\n"}Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Favoritos")}>
          <Text style={styles.iconText}>⭐{"\n"}Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Text style={styles.iconText}>👤{"\n"}Perfil</Text>
        </TouchableOpacity>
      </View>
   </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#7C4DFF",
  },
  overlay: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 120,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7C4DFF",
  },
  heading: {
    fontSize: 26,
    fontWeight: "600",
    color: "#E0F7FA",
    marginBottom: 28,
    textAlign: "center",
  },
  label: { fontSize: 16, color: "#B2EBF2", marginTop: 8 },
  value: {
    fontSize: 16,
    color: "#E0F7FA",
    marginBottom: 12,
    borderBottomColor: "#80DEEA",
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E0F7FA",
    marginTop: 32,
    marginBottom: 16,
    textAlign: "center",
  },
  empty: {
    color: "#E0F7FA",
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 16,
    lineHeight: 26,
  },
  list: { paddingBottom: 24 },
  card: {
    backgroundColor: "#E0F7FA",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: { height: 120, width: "100%" },
  info: { padding: 12 },
  title: { fontSize: 18, fontWeight: "600", color: "#4A148C" },
  date: { fontSize: 14, color: "#0097A7", marginTop: 4 },
  logoutButton: {
    backgroundColor: "#0097A7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    elevation: 3,
  },
  logoutText: { color: "#E0F7FA", fontWeight: "bold", fontSize: 16 },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 2,
    borderColor: "#80DEEA",
    backgroundColor: "#E0F7FA",
    elevation: 8,
  },
  iconText: {
    fontSize: 18,
    textAlign: "center",
    color: "#7C4DFF",
    lineHeight: 26,
  },
});
