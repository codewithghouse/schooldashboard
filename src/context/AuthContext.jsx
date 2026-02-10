import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [role, setRole] = useState(null);
    const [schoolId, setSchoolId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setUserData(null);
                setRole(null);
                setSchoolId(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const uid = firebaseUser.uid;
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUser(firebaseUser);
                    setUserData(data);
                    setRole(data.role);
                    setSchoolId(data.schoolId);
                } else {
                    // This case happens during the onboarding flow 
                    // before /finalize-invite is called.
                    setUser(firebaseUser);
                    setUserData(null);
                    setRole(null);
                    setSchoolId(null);
                }

            } catch (error) {
                console.error("🔥 Auth Sync Critical Error:", error.code, error.message);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const refreshUserData = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userSnap.exists()) {
                const data = userSnap.data();
                setUserData(data);
                setRole(data.role);
                setSchoolId(data.schoolId);
            }
        } catch (error) {
            console.error("Manual Refresh Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => firebaseSignOut(auth);

    const value = { user, userData, role, schoolId, loading, logout, refreshUserData };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
