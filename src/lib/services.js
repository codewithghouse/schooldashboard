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
import { sendSignInLinkToEmail } from "firebase/auth";

// --- School Services ---
export const getSchool = async (schoolId) => {
    if (!schoolId) return null;
    const docSnap = await getDoc(doc(db, 'schools', schoolId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createSchool = async (schoolData) => {
    if (!auth.currentUser) throw new Error("User not authenticated.");
    const adminUid = auth.currentUser.uid;

    try {
        // 2️⃣ School Create Flow (STRICT ORDER)
        const schoolRef = await addDoc(collection(db, "schools"), {
            name: schoolData.name,
            city: schoolData.city,
            state: schoolData.state || '',
            address: schoolData.address || '',
            adminUid: adminUid,
            createdAt: serverTimestamp()
        });

        // Use setDoc with merge to ensure the user doc exists and has the role
        await setDoc(doc(db, "users", adminUid), {
            schoolId: schoolRef.id,
            role: 'admin',
            email: auth.currentUser.email
        }, { merge: true });

        return schoolRef.id;
    } catch (error) {
        console.error("Error creating school:", error);
        throw error;
    }
};

// --- Class Services ---
export const addClass = async (schoolId, classData) => {
    // SECURITY: Ensure schoolId is explicitly set from the argument
    if (!schoolId) throw new Error("School ID missing for addClass");

    return await addDoc(collection(db, 'classes'), {
        ...classData,
        schoolId: schoolId, // Explicit override
        classTeacherId: classData.classTeacherId || null,
        createdAt: serverTimestamp()
    });
};

export const getClasses = async (schoolId) => {
    const q = query(collection(db, 'classes'), where("schoolId", "==", schoolId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Teacher Services (Pure Frontend Flow) ---
export const inviteTeacher = async (schoolId, teacherData, assignedClassIds = []) => {
    if (!schoolId) throw new Error("School ID missing for inviteTeacher");
    const email = teacherData.email.toLowerCase().trim();

    // Check if email already exists with a different role
    const q = query(collection(db, 'users'), where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) {
        throw new Error("This email is already registered with a role. One email = one role.");
    }

    // 0. Create Invite Document in Firestore (Required for Admin Dashboard Tracking)
    await addDoc(collection(db, 'invites'), {
        email: email,
        role: 'teacher',
        schoolId: schoolId,
        name: teacherData.name,
        subjects: teacherData.subjects || [],
        assignedClassIds: assignedClassIds,
        invitedBy: auth.currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
    });

    const params = new URLSearchParams({
        role: 'teacher',
        schoolId: schoolId,
        name: teacherData.name,
        subjects: JSON.stringify(teacherData.subjects || []),
        classes: JSON.stringify(assignedClassIds)
    });

    const actionCodeSettings = {
        url: `${window.location.origin}/accept-invite?${params.toString()}`,
        handleCodeInApp: true,
    };

    // 2. Transmit Link via Firebase Auth
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // 3. Store Invite Data in LocalStorage (as per logic A)
    localStorage.setItem("inviteEmail", email);
    localStorage.setItem("inviteRole", "teacher");
    localStorage.setItem("inviteSchoolId", schoolId);
    localStorage.setItem("inviteName", teacherData.name);
    localStorage.setItem("inviteSubjects", JSON.stringify(teacherData.subjects || []));
    localStorage.setItem("inviteClassIds", JSON.stringify(assignedClassIds));

    console.log("✅ Teacher invitation link sent via Firebase.");
    return true;
};

export const getTeachers = async (schoolId) => {
    if (!schoolId) return [];

    // 1. Fetch Active Profiled Teachers
    const teachersQ = query(collection(db, 'teachers'), where("schoolId", "==", schoolId));
    const teachersSnap = await getDocs(teachersQ);
    const activeTeachers = teachersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'active'
    }));

    const activeEmails = new Set(activeTeachers.map(t => t.email.toLowerCase()));

    // 2. Cross-reference with 'users' collection (The Fail-safe)
    const usersQ = query(collection(db, 'users'),
        where("schoolId", "==", schoolId),
        where("role", "==", "teacher")
    );
    const usersSnap = await getDocs(usersQ);
    usersSnap.docs.forEach(uDoc => {
        const uData = uDoc.data();
        const email = uData.email.toLowerCase();
        if (!activeEmails.has(email)) {
            activeTeachers.push({
                id: uDoc.id,
                uid: uDoc.id,
                ...uData,
                status: 'active' // They are logged in, just missing profile doc
            });
            activeEmails.add(email);
        }
    });

    // 3. Fetch Pending Invites from 'invites' collection
    const invitesQ = query(collection(db, 'invites'),
        where("schoolId", "==", schoolId),
        where("status", "==", "pending")
    );
    const invitesSnap = await getDocs(invitesQ);
    const pendingInvites = invitesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'pending'
    }));

    // Filter out redundant invites if they've already joined
    const filteredInvites = pendingInvites.filter(inv => !activeEmails.has(inv.email.toLowerCase()));

    return [...activeTeachers, ...filteredInvites];
};

export const updateTeacherDetails = async (schoolId, teacherId, updateData, assignedClassIds = []) => {
    if (!schoolId || !teacherId) throw new Error("Reference identifiers missing.");

    // 1. Check if it's a Pending Invite
    const inviteRef = doc(db, 'invites', teacherId);
    const inviteSnap = await getDoc(inviteRef);

    if (inviteSnap.exists()) {
        // Update Pending Invite
        await updateDoc(inviteRef, {
            name: updateData.name,
            subjects: updateData.subjects,
            assignedClassIds: assignedClassIds,
            updatedAt: serverTimestamp()
        });
        return true;
    }

    // 2. Active Teacher Flow (Use setDoc merge to be safe)
    const teacherRef = doc(db, 'teachers', teacherId);
    await setDoc(teacherRef, {
        name: updateData.name,
        subjects: updateData.subjects,
        updatedAt: serverTimestamp()
    }, { merge: true });

    // 1. Also ensure user document reflects name if needed
    await setDoc(doc(db, 'users', teacherId), { name: updateData.name }, { merge: true });

    // 2. Sync Classes
    // Unassign old
    const q = query(collection(db, 'classes'), where("classTeacherId", "==", teacherId));
    const snap = await getDocs(q);
    const unassignPromises = snap.docs.map(c => updateDoc(doc(db, 'classes', c.id), { classTeacherId: null }));
    await Promise.all(unassignPromises);

    // Assign new
    const assignPromises = assignedClassIds.map(classId =>
        updateDoc(doc(db, 'classes', classId), { classTeacherId: teacherId })
    );
    await Promise.all(assignPromises);

    return true;
};

export const deleteTeacher = async (schoolId, teacherId) => {
    if (!teacherId) return;

    // 1. Check if it's an invite or an active teacher
    const inviteRef = doc(db, 'invites', teacherId);
    const inviteSnap = await getDoc(inviteRef);

    if (inviteSnap.exists()) {
        await deleteDoc(inviteRef);
        return { success: true, type: 'invite' };
    }

    // 2. Active Teacher Flow
    const teacherUid = teacherId;

    // Unassign classes
    const classesQuery = query(collection(db, 'classes'), where("classTeacherId", "==", teacherUid));
    const classesSnap = await getDocs(classesQuery);
    const unassignPromises = classesSnap.docs.map(c => updateDoc(doc(db, 'classes', c.id), { classTeacherId: null }));
    await Promise.all(unassignPromises);

    await deleteDoc(doc(db, 'users', teacherUid)).catch(() => { });
    await deleteDoc(doc(db, 'teachers', teacherUid)).catch(() => { });

    return { success: true, type: 'active' };
};

// --- Student Services ---
export const addStudent = async (schoolId, studentData) => {
    const docRef = await addDoc(collection(db, 'students'), {
        ...studentData,
        schoolId,
        createdAt: serverTimestamp()
    });

    // Invite Parent
    const email = studentData.parentEmail.toLowerCase().trim();

    // Check if email already exists with a different role
    const q = query(collection(db, 'users'), where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) {
        console.warn("Parent email already has a role. Skipping invite.");
        return docRef;
    }
    const params = new URLSearchParams({
        role: 'parent',
        schoolId: schoolId,
        studentId: docRef.id
    });

    const actionCodeSettings = {
        url: `${window.location.origin}/accept-invite?${params.toString()}`,
        handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    localStorage.setItem("inviteEmail", email);
    localStorage.setItem("inviteRole", "parent");
    localStorage.setItem("inviteSchoolId", schoolId);
    localStorage.setItem("inviteStudentId", docRef.id);

    return docRef;
};

export const bulkAddStudents = async (schoolId, studentsArray) => {
    const promises = studentsArray.map(student => addStudent(schoolId, student));
    return Promise.all(promises);
};

export const getStudents = async (schoolId, classId = null) => {
    let q = classId
        ? query(collection(db, 'students'), where("schoolId", "==", schoolId), where("classId", "==", classId))
        : query(collection(db, 'students'), where("schoolId", "==", schoolId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Parent Services ---
export const getMyStudents = async (parentEmail, parentUid = null) => {
    let q;
    if (parentUid) {
        q = query(collection(db, 'students'), where("parentUid", "==", parentUid));
    } else {
        q = query(collection(db, 'students'), where("parentEmail", "==", parentEmail));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Other Services ---
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
