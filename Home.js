import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { database } from "../firebaseConfig";
import CriarEvento from "./CriarEvento";
 
export default function Home({ navigation }) {
  const { user } = useAuth();
  const scrollRef = useRef(null);
 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");
  const [favoritos, setFavoritos] = useState([]);
  const [search, setSearch] = useState("");
 
  // 1) Detecta se é admin
  useEffect(() => {
    const ref = database.collection("users").doc(user.uid);
    ref.get().then((doc) => {
      if (doc.exists && doc.data().isAdmin === true) {
        setIsAdmin(true);
      }
    });
  }, [user.uid]);
 
  // 2) Carrega eventos em tempo real
useEffect(() => {
    const unsubscribe = database
      .collection("events")
      .orderBy("datetime", "asc")
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(data);
        setLoading(false);
      });
    return () => unsubscribe();
  }, []);
 
  // 3) Carrega favoritos do usuário
  useEffect(() => {
    const ref = database.collection("users").doc(user.uid);
    ref.get().then((doc) => {
      if (doc.exists) {
        setFavoritos(doc.data().favoritos || []);
      }
    });
  }, [user.uid]);
 
  // Toast simples
  const showToastMessage = (message) => {
    setToastText(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };
 
  // Toggle favorito
  const toggleFavorito = async (eventId) => {
    const ref = database.collection("users").doc(user.uid);
    const isFav = favoritos.includes(eventId);
    const novos = isFav
      ? favoritos.filter((id) => id !== eventId)
      : [...favoritos, eventId];
    setFavoritos(novos);
    try {
      await ref.update({ favoritos: novos });
      showToastMessage(isFav ? "Removido dos favoritos" : "Adicionado aos favoritos");
    } catch {
      Alert.alert("Erro ao atualizar favoritos.");
    }
  };
 
  // Filtra eventos pelo título
  const filteredEvents = events.filter((evt) =>
    evt.title.toLowerCase().includes(search.toLowerCase())
  );
 
  // Item da lista
  const renderItem = ({ item }) => {
    const isFav = favoritos.includes(item.id);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("EventDetails", { event: item })}
      >
        <View style={styles.card}>
          <View style={styles.cardImageWrapper}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <TouchableOpacity
              onPress={() => toggleFavorito(item.id)}
              style={styles.favButton}
            >
              <Text style={{ fontSize: 20 }}>{isFav ? "⭐" : "☆"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.datetime.toDate()).toLocaleDateString("pt-PT")} às{" "}
              {new Date(item.datetime.toDate()).toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
      
            <Text style={styles.cardLocation}>📍 {item.location}</Text>
            <View style={styles.cardDescBox}>
  <Text style={styles.cardDesc}>{item.description}</Text>
</View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
 
  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 50 }}
        size="large"
        color="#ed128d"
      />
    );
  }
 
  return (
    <ImageBackground
      source={require("../assets/home1.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastText}</Text>
        </View>
      )}
 
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        ref={scrollRef}
      >
        {/* Barra de busca */}
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar evento..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
 
        {/* Botão Criar Evento (só admin) */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.createButtonText}>
              {showForm ? "Cancelar" : "+ Criar Evento"}
            </Text>
          </TouchableOpacity>
        )}
 
        {showForm && <CriarEvento onSuccess={() => setShowForm(false)} />}
 
        {/* Lista de eventos filtrados */}
        {filteredEvents.length === 0 ? (
          <Text style={styles.emptyText}>
            {search
              ? "Nenhum evento encontrado."
              : "Não há eventos disponíveis."}
          </Text>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={true}
          />
        )}
      </ScrollView>
 
      {/* Barra inferior de navegação */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => navigation.navigate("Eventos")}>
          <Text style={styles.bottomText}>🏠{"\n"}Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Favoritos")}>
          <Text style={styles.bottomText}>⭐{"\n"}Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Text style={styles.bottomText}>👤{"\n"}Perfil</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  toast: {
    cardDescBox: {
  backgroundColor: "rgba(124, 77, 255, 0.12)", // roxo translúcido
  padding: 10,
  borderRadius: 12,
  marginTop: 8,
},
    position: "absolute",
    top: 40,
    left: "10%",
    right: "10%",
    backgroundColor: "#26C6DA",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    zIndex: 999,
  },
  toastText: { color: "#E0F7FA", fontWeight: "bold", textAlign: "center" },

  searchBar: {
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "rgba(224,247,250,0.9)",
    fontSize: 16,
    color: "#006064",
  },

  createButton: {
    backgroundColor: "#E0F7FA",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#7C4DFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#E0F7FA",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardImageWrapper: { position: "relative" },
  cardImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(224,247,250,0.9)",
    borderRadius: 20,
    padding: 6,
  },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#4A148C" },
  cardDate: { fontSize: 14, color: "#0097A7", marginTop: 4 },
  cardLocation: { fontSize: 14, color: "#006064", marginTop: 4 },
  cardDesc: { fontSize: 14, color: "#00796B", marginTop: 6 },

  emptyText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
    color: "#80CBC4",
  },

  bottomBar: {
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
  bottomText: {
    fontSize: 18,
    textAlign: "center",
    color: "#7C4DFF",
  },
});

