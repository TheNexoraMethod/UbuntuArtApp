import { getFirestoreDb } from "../utils/firebase-admin.js";
import { auth } from "@/app/api/utils/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const db = await getFirestoreDb();
    const roomsRef = db.collection("rooms");
    const snapshot = await roomsRef.get();

    if (snapshot.empty) {
      return Response.json({ residencies: [] });
    }

    let residencies = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Convert Firestore room data to residency format
      const residency = {
        id: doc.id,
        title: data.name,
        description: data.description,
        // Handle both single imageUrl and imageUrls array
        image_url:
          data.imageUrl || (data.imageUrls && data.imageUrls[0]) || null,
        imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
        location: data.location || null,
        amenities: data.amenities || [],
        available: data.available !== false,
        rating: data.rating || 0,
        room_type: data.room_type || "standard",
        pricing_config: {
          price_per_night: data.pricePerNight || 150,
        },
      };

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          residency.title?.toLowerCase().includes(searchLower) ||
          residency.description?.toLowerCase().includes(searchLower) ||
          residency.location?.toLowerCase().includes(searchLower);

        if (matchesSearch) {
          residencies.push(residency);
        }
      } else {
        residencies.push(residency);
      }
    });

    // Sort: available first, then by rating, then by title
    residencies.sort((a, b) => {
      if (a.available !== b.available) {
        return b.available ? 1 : -1;
      }
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      return (a.title || "").localeCompare(b.title || "");
    });

    return Response.json({ residencies });
  } catch (error) {
    console.error("GET /api/residencies error:", error);
    return Response.json(
      { error: "Failed to fetch residencies" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      image_url,
      price_per_day,
      capacity,
      location,
      amenities,
      available = true,
      rating = 0,
    } = body;

    if (!title || !price_per_day || !capacity) {
      return Response.json(
        { error: "Missing required fields: title, price_per_day, capacity" },
        { status: 400 },
      );
    }

    const db = await getFirestoreDb();
    const roomsRef = db.collection("rooms");

    const newRoom = {
      name: title,
      description: description || null,
      imageUrl: image_url || null,
      pricePerNight: price_per_day,
      maxGuests: capacity,
      location: location || null,
      amenities: amenities || [],
      available: available,
      rating: rating,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await roomsRef.add(newRoom);

    const residency = {
      id: docRef.id,
      title: newRoom.name,
      description: newRoom.description,
      image_url: newRoom.imageUrl,
      price_per_day: newRoom.pricePerNight,
      capacity: newRoom.maxGuests,
      location: newRoom.location,
      amenities: newRoom.amenities,
      available: newRoom.available,
      rating: newRoom.rating,
    };

    return Response.json({ residency });
  } catch (error) {
    console.error("POST /api/residencies error:", error);
    return Response.json(
      { error: "Failed to create residency" },
      { status: 500 },
    );
  }
}
