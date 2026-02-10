import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dummySyllabus = [
    {
        subject: "Mathematics",
        chapters: ["Algebra", "Trigonometry", "Geometry", "Calculus", "Probability"]
    },
    {
        subject: "Science",
        chapters: ["Physics: Motion", "Chemistry: Atoms", "Biology: Cells", "Environmental Science", "Energy Sources"]
    },
    {
        subject: "English",
        chapters: ["Tenses", "Poetry Analysis", "Short Stories", "Drama", "Creative Writing"]
    }
];

async function seed() {
    try {
        console.log("Starting syllabus seeding...");

        // 1. Get first school
        const schoolsSnap = await getDocs(collection(db, "schools"));
        if (schoolsSnap.empty) {
            console.error("No schools found in Firestore. Please register a school first.");
            return;
        }
        const schoolId = schoolsSnap.docs[0].id;
        const schoolName = schoolsSnap.docs[0].data().name;
        console.log(`Found school: ${schoolName} (${schoolId})`);

        // 2. Get first class for this school
        const classQ = query(collection(db, "classes"), where("schoolId", "==", schoolId));
        const classesSnap = await getDocs(classQ);
        if (classesSnap.empty) {
            console.error(`No classes found for school ${schoolId}.`);
            return;
        }
        const classId = classesSnap.docs[0].id;
        const className = classesSnap.docs[0].data().name;
        console.log(`Found class: ${className} (${classId})`);

        // 3. Upload dummy syllabus
        for (const item of dummySyllabus) {
            await addDoc(collection(db, "syllabus"), {
                schoolId,
                classId,
                subject: item.subject,
                chapters: item.chapters,
                createdAt: serverTimestamp()
            });
            console.log(`Uploaded syllabus for ${item.subject}`);
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding:", err);
        process.exit(1);
    }
}

seed();
