import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useContentManager() {
  const queryClient = useQueryClient();

  // Fetch images
  const { data: imagesData, isLoading: loadingImages } = useQuery({
    queryKey: ["admin-images"],
    queryFn: async () => {
      const res = await fetch("/api/admin/images");
      if (!res.ok) throw new Error("Failed to fetch images");
      return res.json();
    },
  });

  // Fetch users
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Fetch rooms for bulk upload
  const { data: roomsData } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/rooms");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return res.json();
    },
  });

  // Update image mutation
  const updateImageMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/admin/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update image");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-images"]);
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async ({ id, source }) => {
      const res = await fetch(`/api/admin/images?id=${id}&source=${source}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete image");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-images"]);
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to upload image");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-images"]);
    },
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (imagesData) => {
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagesData),
      });
      if (!res.ok) throw new Error("Failed to upload images");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-images"]);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
    },
  });

  return {
    imagesData,
    loadingImages,
    usersData,
    loadingUsers,
    roomsData,
    updateImageMutation,
    deleteImageMutation,
    uploadImageMutation,
    bulkUploadMutation,
    updateUserMutation,
    deleteUserMutation,
  };
}
