import { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Asegúrate de ajustar la ruta según la ubicación de tu archivo firebase
import { getDoc, doc } from 'firebase/firestore';

interface AuthData {
  isAuthenticated: boolean;
  userRole: string | null;
}

export function useAuth(): AuthData {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data?.role || null); // Asignar el rol del usuario
          }
        } catch (error) {
          console.error('Error obteniendo el rol del usuario:', error);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { isAuthenticated, userRole };
}
