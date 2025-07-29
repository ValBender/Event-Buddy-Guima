import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { signUp } from "../services/firebaseAuth";
import { auth, database } from "../firebaseConfig";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      await signUp(email, password);

      auth.onAuthStateChanged(async (newUser) => {
        if (newUser) {
          console.log("Novo usuário:", newUser.uid);

          // ✅ Cria documento no Firestore
          await database.collection("users").doc(newUser.uid).set({
            email: newUser.email,
            name: name.trim(),
            isAdmin: false,
            favoritos: [],
          });

          Alert.alert("Conta criada com sucesso!");
          navigation.navigate("Login");
        }
      });
    } catch (error) {
      console.error("Erro ao registrar:", error);
      Alert.alert("Erro ao registrar", error.message || "Tente novamente.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/logo2.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TextInput
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#ccc"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#ccc"
        />
        <TextInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#ccc"
        />
        <TextInput
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity style={styles.customButton} onPress={handleSignUp}>
          <Text style={styles.customButtonText}>Registar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Já tens conta? Fazer login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 130,
    backgroundColor: "rgba(0,0,0,0.4)",
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
  customButton: {
    width: "50%",
    alignSelf: "center",
    backgroundColor: "#7C4DFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 24,
  },
  customButtonText: {
    color: "#E0F7FA",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
  link: {
    textAlign: "center",
    color: "#80DEEA",
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: "underline",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
