import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ClassContext = createContext();

export const useClass = () => {
    const context = useContext(ClassContext);
    if (!context) {
        throw new Error('useClass must be used within a ClassProvider');
    }
    return context;
};

export const ClassProvider = ({ children }) => {
    const { userData, schoolId, role } = useAuth();
    const [myClasses, setMyClasses] = useState([]);
    const [activeClassId, setActiveClassId] = useState(localStorage.getItem('activeClassId') || null);
    const [activeClass, setActiveClass] = useState(null);
    const [loadingClasses, setLoadingClasses] = useState(false);

    // Load classes when teacher logs in
    useEffect(() => {
        const loadClasses = async () => {
            if (role === 'teacher' && schoolId && userData?.uid) {
                setLoadingClasses(true);
                try {
                    console.log("Fetching assigned classes for teacher UID:", userData.uid);

                    const q = query(
                        collection(db, 'classes'),
                        where("schoolId", "==", schoolId),
                        where("classTeacherId", "==", userData.uid)
                    );

                    const querySnapshot = await getDocs(q);
                    const assigned = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    if (assigned.length === 0) {
                        console.warn("🔻 DATA ALERT: No classes found linked to teacher UID:", userData.uid);
                        console.log("Check if 'classTeacherId' field exists in Firestore for target classes.");
                    } else {
                        console.log("SUCCESS: Fetched Assigned Classes for Teacher:", assigned);
                    }

                    setMyClasses(assigned);

                    // Task 6: Auto-select logic
                    let selectedId = activeClassId;

                    // If previously selected class is not in the list anymore
                    if (selectedId && !assigned.find(c => c.id === selectedId)) {
                        selectedId = null;
                        setActiveClass(null);
                        localStorage.removeItem('activeClassId');
                    }

                    // Auto-select if ONLY ONE class exists
                    if (!selectedId && assigned.length === 1) {
                        selectedId = assigned[0].id;
                        console.log("Auto-selecting single class:", selectedId);
                    }

                    if (selectedId) {
                        const selected = assigned.find(c => c.id === selectedId);
                        if (selected) {
                            setActiveClassId(selectedId);
                            setActiveClass(selected);
                            localStorage.setItem('activeClassId', selectedId);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load classes in context:", error);
                } finally {
                    setLoadingClasses(false);
                }
            } else {
                setMyClasses([]);
                setActiveClassId(null);
                setActiveClass(null);
                localStorage.removeItem('activeClassId');
            }
        };

        loadClasses();
    }, [role, schoolId, userData?.uid]);

    const handleClassChange = (id, classList = myClasses) => {
        const selected = classList.find(c => c.id === id);
        if (selected) {
            setActiveClassId(id);
            setActiveClass(selected);
            localStorage.setItem('activeClassId', id);
        } else {
            setActiveClassId(null);
            setActiveClass(null);
            localStorage.removeItem('activeClassId');
        }
    };

    const value = {
        myClasses,
        activeClassId,
        activeClass,
        setActiveClass: handleClassChange,
        loadingClasses
    };

    return (
        <ClassContext.Provider value={value}>
            {children}
        </ClassContext.Provider>
    );
};
