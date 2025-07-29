import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { database } from "../firebaseConfig";
 
export default function EventDetails({ route, navigation }) {
  const { event } = route.params;
  const { user } = useAuth();
 
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventDetails, setEventDetails] = useState(event);
  const [isParticipant, setIsParticipant] = useState(false);
  const [favorited, setFavorited] = useState(false);
 
  useEffect(() => {
    const ref = database.collection("users").doc(user.uid);
    ref.get().then((doc) => {
      if (doc.exists && doc.data().isAdmin === true) {
        setIsAdmin(true);
      }
    });
  }, [user.uid]);
 
  useEffect(() => {
    const unsubscribe = database
      .collection("events")
      .doc(event.id)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const updated = { id: doc.id, ...doc.data() };
          setEventDetails(updated);
          setIsParticipant(updated.participants?.includes(user.uid));
        }
      });
 
    return () => unsubscribe();
  }, [event.id, user.uid]);
 
  useEffect(() => {
    const ref = database.collection("users").doc(user.uid);
    ref.get().then((doc) => {
      const favs = doc.exists ? doc.data().favoritos || [] : [];
      setFavorited(favs.includes(event.id));
    });
  }, [event.id, user.uid]);
 
  const handleToggleParticipation = async () => {
    try {
      const ref = database.collection("events").doc(eventDetails.id);
      const updated = isParticipant
        ? eventDetails.participants.filter((id) => id !== user.uid)
        : [...eventDetails.participants, user.uid];
 
      await ref.update({ participants: updated });
      setIsParticipant(!isParticipant);
      Alert.alert(isParticipant ? "Participação cancelada." : "Participação confirmada!");
    } catch (err) {
      console.error("Erro ao participar:", err);
      Alert.alert("Erro ao participar do evento.");
    }
  };
 
  const handleToggleFavorite = async () => {
    try {
      const ref = database.collection("users").doc(user.uid);
      const doc = await ref.get();
      if (!doc.exists) return;
 
      const favs = doc.data().favoritos || [];
      const atualizados = favorited
        ? favs.filter((id) => id !== event.id)
        : [...favs, event.id];
 
      await ref.update({ favoritos: atualizados });
      setFavorited(!favorited);
 
      Alert.alert(favorited ? "Removido dos favoritos." : "Adicionado aos favoritos.");
    } catch (err) {
      console.error("Erro ao atualizar favoritos:", err);
      Alert.alert("Erro ao atualizar favoritos.");
    }
  };
 
  const handleDeleteEvent = async () => {
    Alert.alert("Confirmar", "Excluir este evento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await database.collection("events").doc(eventDetails.id).delete();
            Alert.alert("Evento excluído.");
            navigation.goBack();
          } catch (err) {
            console.error("Erro:", err);
            Alert.alert("Erro ao excluir.");
          }
        },
      },
    ]);
  };
 
  return (
    <ImageBackground
      source={require("../assets/home1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.overlay}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: eventDetails.imageUrl }} style={styles.image} />
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.starButton}>
            <Text style={styles.star}>{favorited ? "⭐" : "☆"}</Text>
          </TouchableOpacity>
        </View>
 
        <Text style={styles.title}>{eventDetails.title}</Text>
        <Text style={styles.date}>
          {new Date(eventDetails.datetime.toDate()).toLocaleDateString("pt-PT")} às{" "}
          {new Date(eventDetails.datetime.toDate()).toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text style={styles.location}>📍 {eventDetails.location}</Text>
        <View style={styles.descriptionWrapper}>
  <Text style={styles.description}>{eventDetails.description}</Text>
</View>
        <Text style={styles.participants}>
          👥 Participantes: {eventDetails.participants?.length || 0}
        </Text>
 
        <TouchableOpacity style={styles.button} onPress={handleToggleParticipation}>
          <Text style={styles.buttonText}>
            {isParticipant ? "❌ Cancelar participação" : "✋ Participar"}
          </Text>
        </TouchableOpacity>
 
        {isAdmin && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#5e17eb" }]}
            onPress={() =>
              navigation.navigate("EditarEvento", { event: eventDetails })
            }
          >
            <Text style={styles.buttonText}>✏️ Editar evento</Text>
          </TouchableOpacity>
        )}
 
        {isAdmin && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#EF4444" }]}
            onPress={handleDeleteEvent}
          >
            <Text style={styles.buttonText}>🗑 Excluir evento</Text>
          </TouchableOpacity>
        )}
       
      </ScrollView>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  descriptionWrapper: {
  backgroundColor: "#7C4DFF", // ou #E0F7FA para algo sólido
  padding: 12,
  borderRadius: 12,
  marginBottom: 20,
},

  background: { flex: 1 },
  overlay: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 100,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  starButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(224,247,250,0.9)",
    borderRadius: 20,
    padding: 6,
  },
  star: { fontSize: 22 },
  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    color: "#E0F7FA",
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: "#B2EBF2",
    textAlign: "center",
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: "#B2EBF2",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#80DEEA",
    marginBottom: 20,
    lineHeight: 22,
  },
  participants: {
    fontSize: 16,
    color: "#E0F7FA",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#7C4DFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
  },
  buttonText: {
    color: "#E0F7FA",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 3,
    borderColor: "#B2EBF2",
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
