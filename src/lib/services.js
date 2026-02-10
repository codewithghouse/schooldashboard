import { db } from './firebase';
import {
    collection,
    addDoc,
    updateDoc,
    setDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';
import { auth } from './firebase';

// --- School Services ---
export const getSchool = async (schoolId) => {
    const docSnap = await getDoc(doc(db, 'schools', schoolId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createSchool = async (schoolData, adminUid) => {
    try {
        const schoolRef = await addDoc(collection(db, 'schools'), {
            ...schoolData,
            createdAt: serverTimestamp(),
            createdBy: adminUid
        });

        const userRef = doc(db, 'users', adminUid);
        await setDoc(userRef, {
            uid: adminUid,
            email: auth.currentUser?.email || '',
            role: 'school_admin',
            schoolId: schoolRef.id,
            createdAt: serverTimestamp()
        }, { merge: true });

        return schoolRef.id;
    } catch (error) {
        console.error("Error creating school:", error);
        throw error;
    }
};

// --- Class Services ---
export const addClass = async (schoolId, classData) => {
    return await addDoc(collection(db, 'classes'), {
        ...classData,
        classTeacherId: classData.classTeacherId || null,
        schoolId,
        createdAt: serverTimestamp()
    });
};

export const getClasses = async (schoolId) => {
    const q = query(collection(db, 'classes'), where("schoolId", "==", schoolId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Email Service (Production Only) ---
// Using Render Backend exclusively for emails and Atomic Invite Creation
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://school-backend-11.onrender.com';

const triggerProductionEmail = async (type, payload) => {
    try {
        console.log(`📧 Dispatching ${type} invite via Backend + Firebase...`);
        // 1. Create Invite Doc
        const response = await fetch(`${BACKEND_URL}/create-invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: type === 'parent' ? 'parent' : type,
                schoolId: payload.schoolId,
                studentId: payload.studentId,
                email: payload.email.toLowerCase().trim(),
                ...payload
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Backend failed to create invite");
        }

        const { inviteId } = await response.json();

        // 2. Transmit Link via Firebase Auth
        const actionCodeSettings = {
            url: `${window.location.origin}/accept-invite?id=${inviteId}`,
            handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, payload.email.toLowerCase().trim(), actionCodeSettings);

        // Note: For students, we might not want to overwrite teacher's localStorage 
        // if the admin is the one sending. But usually the one receiving the email 
        // will have it in the link or they can just re-enter it.
    } catch (error) {
        console.error(`❌ Invite Error:`, error.message);
    }
};

export const finalizeOnboarding = async (uid, email, inviteId) => {
    const response = await fetch(`${BACKEND_URL}/finalize-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email, inviteId })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Onboarding finalization failed");
    }

    return await response.json();
};

// --- Teacher Services (Production Flow) ---
import { sendSignInLinkToEmail } from "firebase/auth";

// --- 85: Teacher Services (Production Flow) ---
export const inviteTeacher = async (schoolId, teacherData, assignedClassIds = []) => {
    // 1. Create Invite Document in Backend
    const response = await fetch(`${BACKEND_URL}/create-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            role: 'teacher',
            email: teacherData.email.toLowerCase().trim(),
            name: teacherData.name,
            schoolId,
            subjects: teacherData.subjects || [],
            classIds: assignedClassIds
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invite record");
    }

    const { inviteId } = await response.json();

    // 2. Send Firebase Auth Email Link
    const actionCodeSettings = {
        url: `${window.location.origin}/accept-invite?id=${inviteId}`,
        handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, teacherData.email.toLowerCase().trim(), actionCodeSettings);

    // Store email locally for the verification step
    window.localStorage.setItem('emailForSignIn', teacherData.email.toLowerCase().trim());

    console.log("✅ Invitation link sent via Firebase.");
    return inviteId;
};

export const getTeachers = async (schoolId) => {
    // Teachers directory now only shows active teachers (those with a UID/Profile)
    const q = query(collection(db, 'teachers'), where("schoolId", "==", schoolId));
    const querySnapshot = await getDocs(q);
    const activeTeachers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Also fetch pending invites to show in the directory
    const iq = query(collection(db, 'invites'), where("schoolId", "==", schoolId), where("status", "==", "pending"));
    const inviteSnapshot = await getDocs(iq);
    const pendingTeachers = inviteSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'invited'
    }));

    return [...activeTeachers, ...pendingTeachers];
};

export const deleteTeacher = async (schoolId, identifier) => {
    console.log(`🗑️ Initiating Safe Delete for: ${identifier}`);

    // Unassign classes
    const classesQuery = query(collection(db, 'classes'), where("classTeacherId", "==", identifier));
    const classesSnap = await getDocs(classesQuery);
    const unassignPromises = classesSnap.docs.map(c => updateDoc(doc(db, 'classes', c.id), { classTeacherId: null }));
    await Promise.all(unassignPromises);

    // If identifier is a UID (active teacher)
    await deleteDoc(doc(db, 'users', identifier)).catch(() => { });
    await deleteDoc(doc(db, 'teachers', identifier)).catch(() => { });

    // If identifier is an inviteId (pending teacher) or find invite by email
    const teacherDoc = await getDoc(doc(db, 'teachers', identifier));
    const email = teacherDoc.exists() ? teacherDoc.data().email : null;

    if (email) {
        const inviteQuery = query(collection(db, 'invites'), where("email", "==", email));
        const inviteSnap = await getDocs(inviteQuery);
        await Promise.all(inviteSnap.docs.map(i => deleteDoc(i.ref)));
    } else {
        await deleteDoc(doc(db, 'invites', identifier)).catch(() => { });
    }

    return { success: true };
};

// --- Student Services ---
export const addStudent = async (schoolId, studentData) => {
    const docRef = await addDoc(collection(db, 'students'), {
        ...studentData,
        schoolId,
        status: 'active',
        createdAt: serverTimestamp()
    });

    await triggerProductionEmail('parent', {
        email: studentData.parentEmail,
        schoolId,
        studentId: docRef.id,
        studentName: studentData.name
    });

    return docRef;
};

export const bulkAddStudents = async (schoolId, studentsArray) => {
    const promises = studentsArray.map(async (student) => {
        const docRef = await addDoc(collection(db, 'students'), {
            ...student,
            schoolId,
            status: 'active',
            createdAt: serverTimestamp()
        });

        await triggerProductionEmail('parent', {
            email: student.parentEmail,
            schoolId,
            studentId: docRef.id,
            studentName: student.name
        });

        return docRef;
    });
    return Promise.all(promises);
};

export const getStudents = async (schoolId, classId = null) => {
    let q = classId
        ? query(collection(db, 'students'), where("schoolId", "==", schoolId), where("classId", "==", classId))
        : query(collection(db, 'students'), where("schoolId", "==", schoolId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Other Services (Unchanged structure, ensuring clean export) ---
export const uploadSyllabus = async (schoolId, syllabusData) => addDoc(collection(db, 'syllabus'), { ...syllabusData, schoolId, createdAt: serverTimestamp() });
export const getSyllabus = async (schoolId, classId = null) => {
    const q = classId ? query(collection(db, 'syllabus'), where("schoolId", "==", schoolId), where("classId", "==", classId)) : query(collection(db, 'syllabus'), where("schoolId", "==", schoolId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const addWeeklyUpdate = async (updateData) => addDoc(collection(db, 'weeklyUpdates'), { ...updateData, createdAt: serverTimestamp() });
export const getWeeklyUpdates = async (schoolId, classId = null) => {
    const q = classId ? query(collection(db, 'weeklyUpdates'), where("schoolId", "==", schoolId), where("classId", "==", classId)) : query(collection(db, 'weeklyUpdates'), where("schoolId", "==", schoolId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const createTest = async (testData) => addDoc(collection(db, 'tests'), { ...testData, createdAt: serverTimestamp() });
export const addTestResult = async (resultData) => addDoc(collection(db, 'results'), { ...resultData, createdAt: serverTimestamp() });
export const saveAIContent = async (aiData) => addDoc(collection(db, 'aiContent'), { ...aiData, createdAt: serverTimestamp() });
export const getAIContent = async (schoolId, teacherId = null) => {
    const q = teacherId ? query(collection(db, 'aiContent'), where("schoolId", "==", schoolId), where("teacherId", "==", teacherId)) : query(collection(db, 'aiContent'), where("schoolId", "==", schoolId), where("draft", "==", false), where("approvedByTeacher", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const updateAIStatus = async (docId, statusData) => updateDoc(doc(db, 'aiContent', docId), { ...statusData, updatedAt: serverTimestamp() });
export const deleteAIContent = async (docId) => deleteDoc(doc(db, 'aiContent', docId));
export const addAnnouncement = async (announcementData) => addDoc(collection(db, 'announcements'), { ...announcementData, createdAt: serverTimestamp() });
export const getAnnouncements = async (schoolId, classId = null) => {
    const q = classId ? query(collection(db, 'announcements'), where("schoolId", "==", schoolId), where("classId", "==", classId)) : query(collection(db, 'announcements'), where("schoolId", "==", schoolId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const getStudentByParentUid = async (parentUid) => {
    const q = query(collection(db, 'students'), where("parentUid", "==", parentUid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

