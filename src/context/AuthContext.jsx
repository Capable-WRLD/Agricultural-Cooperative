import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext({
  user: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If signed out, clear user and stop loading
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // When signed in, load the Firestore user document
      try {
        setLoading(true);

        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const userData = snap.data();
          setUser({ uid: currentUser.uid, email: currentUser.email, ...userData });
        } else {
          // Fallback to basic auth user info if no firestore doc
          setUser({ uid: currentUser.uid, email: currentUser.email });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser({ uid: currentUser.uid, email: currentUser.email });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}