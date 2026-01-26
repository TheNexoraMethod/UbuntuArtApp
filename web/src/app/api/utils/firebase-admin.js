// Firebase Admin SDK for server-side Firestore access
// This runs on the backend, keeping your Firebase credentials secure
// Project: ubuntu-3ce90
// Storage bucket: gs://ubuntu-3ce90.firebasestorage.app
// Gallery images: gs://ubuntu-3ce90.firebasestorage.app/gallery

let adminApp = null;
let db = null;

export async function getFirestoreDb() {
  if (db) return db;

  try {
    // Dynamically import Firebase Admin SDK
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");

    // Check if already initialized
    if (getApps().length === 0) {
      // Initialize with service account credentials
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID || "ubuntu-3ce90",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      };

      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: "ubuntu-3ce90.firebasestorage.app",
      });
    } else {
      adminApp = getApps()[0];
    }

    db = getFirestore(adminApp);
    return db;
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
}
