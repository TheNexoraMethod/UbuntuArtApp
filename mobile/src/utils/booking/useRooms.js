import { useState, useEffect } from "react";
import { fetchRoomsWithImages } from "@/lib/supabaseRest";

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomsWithImages()
      .then(setRooms)
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setRooms([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { rooms, loading };
}
