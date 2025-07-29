EventBuddy Guima

https://snack.expo.dev/@valescabender/event-buddy-guima?platform=ios


Um app mobile de eventos feito com React Native (Expo Snack) e Firebase v8. 
Permite login, cadastro, listagem, busca, favoritos, participação e CRUD de eventos por admins.

Funcionalidades
Autenticação Email/Senha (Firebase Auth v8)

Persistência de sessão via AsyncStorage (mantém login até clicar em “Sair”)

Lista de eventos com imagem, data, local e descrição

Barra de busca em tempo real por título

Favoritar eventos com estrela

Participação em eventos (campo participants)

CRUD de eventos para administradores (isAdmin no Firestore)

Perfil do usuário com botão “Sair”

Pré-requisitos
Conta Google e acesso ao Expo Snack (https://snack.expo.dev/)

Expo Go instalado no smartphone (Android/iOS)

Projeto configurado no console do Firebase (SDK v8)

Configuração no Expo Snack
Crie um novo Snack em https://snack.expo.dev/

Importe seu código nos arquivos correspondentes:

App.js

firebaseConfig.js

context/AuthContext.js

services/firebaseAuth.js

pasta screens/ com Login.js, Signup.js, Home.js, Favoritos.js, Perfil.js, EventDetails.js, CriarEvento.js, EditarEvento.js

Firebase v8 – Setup
No arquivo firebaseConfig.js:

js
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const database = firebase.firestore();

Executando no Expo Go
No Snack, clique em Run on Device.

Abra o QR code no Expo Go do seu celular.

O app carrega e exibe a tela de login (se não houver sessão armazenada).

Após login, ele navega automaticamente para a lista de eventos.

O usuário permanece logado mesmo fechando o Expo Go. Apenas ao tocar em Sair no perfil, a sessão é removida.


Estrutura de Pastas
/

├─ App.js

├─ firebaseConfig.js

├─ context/

│   └─ AuthContext.js

├─ services/

│   └─ firebaseAuth.js


└─ screens/

    ├─ Login.js
    
    ├─ Signup.js
    
    ├─ Home.js
    
    ├─ Favoritos.js
    
    ├─ Perfil.js
    
    ├─ EventDetails.js
    
    ├─ CriarEvento.js
    
    └─ EditarEvento.js
    
Firestore Rules (v8)
js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if true;
      allow write, delete: if isAdmin();
      allow update: if isAdmin() ||
        (request.auth != null &&
         request.resource.data.diff(resource.data)
           .affectedKeys().hasOnly(['participants']));
      function isAdmin() {
        return get(/databases/$(database)/documents/users/$(request.auth.uid))
               .data.isAdmin == true;
      }
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /users/{userId}/favorites/{favId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}

https://github.com/ValBender/Event-Buddy-Guima/blob/main/Event%20Buddy%20%20Guima%20(1).png

Licença
MIT License Feel free to use and customize!
