import { getFirestoreDb } from "../../utils/firebase-admin.js";

export async function POST(request) {
  try {
    // Import Firebase Admin Storage
    const { getStorage } = await import("firebase-admin/storage");
    const { initializeApp, getApps } = await import("firebase-admin/app");

    // Get the Firebase app instance
    const app = getApps()[0];
    if (!app) {
      return Response.json(
        { error: "Firebase not initialized. Please check your credentials." },
        { status: 500 },
      );
    }

    const bucket = getStorage(app).bucket("ubuntu-3ce90.firebasestorage.app");
    const db = await getFirestoreDb();

    // List all files in the gallery folder
    const [files] = await bucket.getFiles({ prefix: "gallery/" });

    // Filter out the folder itself and only get image files
    const imageFiles = files.filter((file) => {
      const name = file.name;
      return (
        name !== "gallery/" &&
        (name.endsWith(".jpg") ||
          name.endsWith(".jpeg") ||
          name.endsWith(".png") ||
          name.endsWith(".gif") ||
          name.endsWith(".webp"))
      );
    });

    const syncedImages = [];
    const errors = [];

    for (const file of imageFiles) {
      try {
        // Get the download URL
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-01-2500", // Far future date for public access
        });

        // Or use the public URL if the file is public
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;

        // Extract filename without extension for title
        const filename = file.name.split("/").pop();
        const title = filename
          .replace(/\.(jpg|jpeg|png|gif|webp)$/i, "")
          .replace(/[-_]/g, " ");

        // Check if this image already exists in Firestore
        const existingImages = await db
          .collection("gallery")
          .where("image_url", "==", publicUrl)
          .get();

        if (existingImages.empty) {
          // Add new image to Firestore
          const newImage = {
            title: title.charAt(0).toUpperCase() + title.slice(1),
            description: null,
            image_url: publicUrl,
            category: null,
            display_order: 0,
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            source: "auto-sync",
            storage_path: file.name,
          };

          const docRef = await db.collection("gallery").add(newImage);
          syncedImages.push({ id: docRef.id, ...newImage });
        } else {
          // Image already exists, skip
          syncedImages.push({
            id: existingImages.docs[0].id,
            status: "already_exists",
            ...existingImages.docs[0].data(),
          });
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push({ file: file.name, error: error.message });
      }
    }

    return Response.json({
      message: `Successfully synced gallery images`,
      synced: syncedImages.length,
      new: syncedImages.filter((img) => img.status !== "already_exists").length,
      existing: syncedImages.filter((img) => img.status === "already_exists")
        .length,
      errors: errors.length,
      images: syncedImages,
      errorDetails: errors,
    });
  } catch (error) {
    console.error("Gallery sync error:", error);
    return Response.json(
      { error: "Failed to sync gallery", details: error.message },
      { status: 500 },
    );
  }
}

// GET endpoint to preview what would be synced (without actually syncing)
export async function GET(request) {
  try {
    const { getStorage } = await import("firebase-admin/storage");
    const { getApps } = await import("firebase-admin/app");

    const app = getApps()[0];
    if (!app) {
      return Response.json(
        { error: "Firebase not initialized" },
        { status: 500 },
      );
    }

    const bucket = getStorage(app).bucket("ubuntu-3ce90.firebasestorage.app");
    const db = await getFirestoreDb();

    const [files] = await bucket.getFiles({ prefix: "gallery/" });

    const imageFiles = files.filter((file) => {
      const name = file.name;
      return (
        name !== "gallery/" &&
        (name.endsWith(".jpg") ||
          name.endsWith(".jpeg") ||
          name.endsWith(".png") ||
          name.endsWith(".gif") ||
          name.endsWith(".webp"))
      );
    });

    const preview = [];
    for (const file of imageFiles) {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;

      const existingImages = await db
        .collection("gallery")
        .where("image_url", "==", publicUrl)
        .get();

      preview.push({
        filename: file.name.split("/").pop(),
        path: file.name,
        url: publicUrl,
        alreadyInFirestore: !existingImages.empty,
        size: file.metadata.size,
        updated: file.metadata.updated,
      });
    }

    return Response.json({
      total: imageFiles.length,
      alreadySynced: preview.filter((p) => p.alreadyInFirestore).length,
      newImages: preview.filter((p) => !p.alreadyInFirestore).length,
      preview,
    });
  } catch (error) {
    console.error("Gallery preview error:", error);
    return Response.json(
      { error: "Failed to preview gallery", details: error.message },
      { status: 500 },
    );
  }
}
