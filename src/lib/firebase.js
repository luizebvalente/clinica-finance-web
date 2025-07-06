import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Configuração real do Firebase fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyAJ2qAejE87EqHfELbfaWqmfqWVsLs0Dls",
  authDomain: "younv-finance.firebaseapp.com",
  projectId: "younv-finance",
  storageBucket: "younv-finance.firebasestorage.app",
  messagingSenderId: "226251137770",
  appId: "1:226251137770:web:15a24ce8121b718b766d93",
  measurementId: "G-4QL6TN0H63"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics (opcional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Configurações de desenvolvimento (comentado para produção)
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;

