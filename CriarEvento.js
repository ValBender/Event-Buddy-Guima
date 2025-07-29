import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { database } from "../firebaseConfig";

export default function CriarEvento({ onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    if (!title || !description || !location || !dateText || !timeText) {
      Alert.alert("Preencha todos os campos.");
      return;
    }

    const [d, m, y] = dateText.split("/");
    const [h, min] = timeText.split(":");
    const iso = `${y}-${m}-${d}T${h}:${min}:00`;
    const datetime = new Date(iso);

    if (isNaN(datetime)) {
      Alert.alert("Data ou hora inválida.");
      return;
    }

    try {
      await database.collection("events").add({
        title,
        description,
        location,
        datetime,
        imageUrl: imageUri || "",
        participants: [],
      });
      setTitle("");
      setDescription("");
      setLocation("");
      setDateText("");
      setTimeText("");
      setImageUri(null);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro ao salvar evento.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 26, marginBottom: 32 }} />

      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]}
        multiline
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Localização"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Data (ex: 25/12/2025)"
        value={dateText}
        onChangeText={setDateText}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Hora (ex: 14:30)"
        value={timeText}
        onChangeText={setTimeText}
        style={styles.input}
        placeholderTextColor="#ccc"
      />

      <TouchableOpacity style={styles.selectImageButton} onPress={handleImagePick}>
        <Text style={styles.selectImageText}>Selecionar Imagem</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <TouchableOpacity onPress={handleCreateEvent} style={styles.button}>
        <Text style={styles.buttonText}>Salvar Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 80,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#E0F7FA",
    borderWidth: 1,
    borderColor: "#80DEEA",
  },
  selectImageButton: {
    backgroundColor: "#80DEEA",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  selectImageText: {
    color: "#6A1B9A",
    fontWeight: "bold",
    fontSize: 16,
  },
  image: {
    height: 160,
    width: "100%",
    borderRadius: 8,
    marginVertical: 12,
  },
  button: {
    width: "60%",
    alignSelf: "center",
    backgroundColor: "#7C4DFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#E0F7FA",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
});


