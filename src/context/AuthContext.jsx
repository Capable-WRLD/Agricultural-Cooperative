import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshUser: async () => null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);
      const refreshedUser = snap.exists()
        ? { uid: currentUser.uid, email: currentUser.email, ...snap.data() }
        : { uid: currentUser.uid, email: currentUser.email };

      setUser(refreshedUser);
      return refreshedUser;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      const fallbackUser = { uid: currentUser.uid, email: currentUser.email };
      setUser(fallbackUser);
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If signed out, clear user and stop loading
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      await refreshUser();
    });

    return unsubscribe;
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
