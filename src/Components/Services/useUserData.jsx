import { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Try to fetch from the "users" collection first
          let docRef = doc(db, "users", user.uid);
          let docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            // If not found in "users", check in "firsttimers"
            docRef = doc(db, "firsttimers", user.uid);
            docSnap = await getDoc(docRef);
          }
          
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setError("User data not found");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { userData, loading, error };
};

export default useUserData;