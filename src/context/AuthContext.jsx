import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

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

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setUserData(null);
                setRole(null);
                setSchoolId(null);
                setLoading(false);
                return;
            }

            setUser(firebaseUser);
            setLoading(true);

            // 🚀 REAL-TIME USER DATA SYNC
            const userRef = doc(db, "users", firebaseUser.uid);
            const unsubProfile = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setRole(data.role);
                    setSchoolId(data.schoolId);
                    console.log("👤 Real-time Auth Synced:", data.role, data.schoolId);
                } else {
                    setUserData(null);
                    setRole(null);
                    setSchoolId(null);
                }
                setLoading(false);
            }, (error) => {
                console.error("🔥 Profile Sync Error:", error);
                setLoading(false);
            });

            return () => {
                unsubProfile();
            };
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
