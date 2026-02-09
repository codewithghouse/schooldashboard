import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
    doc,
    getDoc,
    query,
    collection,
    where,
    getDocs,
    limit
} from 'firebase/firestore';
import { runAtomicOnboarding } from '../lib/services';

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

                // 1. Check if user already exists in /users (Production source of truth)
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUser(firebaseUser);
                    setUserData(data);
                    setRole(data.role); // school_admin or teacher
                    setSchoolId(data.schoolId);
                } else {
                    console.log("No user document found. Checking for pending invites...");

                    // 2. CHECK FOR PENDING INVITE (Email based discovery)
                    const inviteQuery = query(
                        collection(db, "invites"),
                        where("email", "==", firebaseUser.email.toLowerCase()),
                        where("status", "==", "pending"),
                        limit(1)
                    );
                    const inviteSnap = await getDocs(inviteQuery);

                    if (!inviteSnap.empty) {
                        const inviteDoc = inviteSnap.docs[0];
                        console.log("🔥 Found Pending Invite! Starting Atomic Onboarding via Transaction...");

                        // 3. RUN ATOMIC TRANSACTION (All-or-Nothing)
                        await runAtomicOnboarding(firebaseUser, inviteDoc);

                        // 4. Fetch the newly created profile
                        const freshSnap = await getDoc(userRef);
                        const data = freshSnap.data();

                        setUser(firebaseUser);
                        setUserData(data);
                        setRole(data.role);
                        setSchoolId(data.schoolId);
                        console.log("✅ [Auth] Onboarding Successful.");
                    } else {
                        // User is logged in but has no /users doc and no /invites doc
                        // Likely a stray login or admin who hasn't completed setup
                        setUser(firebaseUser);
                        setUserData(null);
                        setRole(null);
                        setSchoolId(null);
                    }
                }

            } catch (error) {
                console.error("🔥 Auth Sync Critical Error:", error.code, error.message);
                // Ensure state isn't stuck on loading if transaction fails
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const logout = () => firebaseSignOut(auth);

    const value = { user, userData, role, schoolId, loading, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

