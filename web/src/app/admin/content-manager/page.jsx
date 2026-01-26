"use client";

import { useState } from "react";
import useUpload from "@/utils/useUpload";
import { useContentManager } from "@/hooks/useContentManager";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/ContentManager/Header";
import { TabNavigation } from "@/components/ContentManager/TabNavigation";
import { RoomsTab } from "@/components/ContentManager/RoomsTab/RoomsTab";
import { ImagesTab } from "@/components/ContentManager/ImagesTab/ImagesTab";
import { UsersTab } from "@/components/ContentManager/UsersTab/UsersTab";
import { ImageUploadModal } from "@/components/ContentManager/Modals/ImageUploadModal";
import { ImageEditModal } from "@/components/ContentManager/Modals/ImageEditModal";
import { UserEditModal } from "@/components/ContentManager/Modals/UserEditModal";
import { BulkUploadModal } from "@/components/ContentManager/Modals/BulkUploadModal";

export default function ContentManagerPage() {
  const [activeTab, setActiveTab] = useState("rooms");
  const [imageModal, setImageModal] = useState(null);
  const [userModal, setUserModal] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [bulkUploadModal, setBulkUploadModal] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(null);
  const [upload] = useUpload();
  const queryClient = useQueryClient();

  const {
    imagesData,
    loadingImages,
    usersData,
    loadingUsers,
    updateImageMutation,
    deleteImageMutation,
    uploadImageMutation,
    updateUserMutation,
    deleteUserMutation,
  } = useContentManager();

  // Fetch rooms for bulk upload and room images tab
  const {
    data: roomsData,
    error: roomsError,
    isLoading: roomsLoading,
  } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/rooms");
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch rooms:", errorText);
        throw new Error(
          `Failed to fetch rooms: ${res.status} ${res.statusText}`,
        );
      }
      const data = await res.json();
      return data;
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: async (roomData) => {
      const res = await fetch("/api/admin/rooms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      });
      if (!res.ok) throw new Error("Failed to update room");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-rooms"]);
      queryClient.invalidateQueries(["rooms"]);
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
    onSuccess: (data) => {
      queryClient.invalidateQueries(["admin-images"]);
      setBulkUploadProgress(data);

      // Auto-close modal after 2 seconds on successful upload
      setTimeout(() => {
        setBulkUploadModal(false);
        setBulkUploadProgress(null);
      }, 2000);
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload({ file });
    setUploadModal({ uploadedUrl: result.url });
  };

  const handleBulkImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Clear any previous progress state
    setBulkUploadProgress(null);
    setBulkUploadModal({ files, uploadedUrls: [] });

    // Upload all files
    const uploadedUrls = [];
    for (const file of files) {
      const result = await upload({ file });
      uploadedUrls.push({ url: result.url, filename: file.name });
    }

    setBulkUploadModal({ files, uploadedUrls });
  };

  const handleSaveBulkUpload = (formData) => {
    const imagesData = bulkUploadModal.uploadedUrls.map((uploaded) => {
      const roomName = formData.get(`room-${uploaded.filename}`);
      const category = formData.get(`category-${uploaded.filename}`);
      const title =
        formData.get(`title-${uploaded.filename}`) || uploaded.filename;

      return {
        imageUrl: uploaded.url,
        title,
        description: "",
        category: category || "general",
        isFeatured: false,
        source: roomName ? "residency" : "gallery",
        roomName: roomName || null,
      };
    });

    bulkUploadMutation.mutate(imagesData);
  };

  const handleSaveUpload = (formData) => {
    uploadImageMutation.mutate(
      {
        imageUrl: formData.uploadedUrl,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isFeatured: formData.isFeatured,
        source: "gallery",
      },
      {
        onSuccess: () => setUploadModal(false),
      },
    );
  };

  const handleSaveImageEdit = (data) => {
    updateImageMutation.mutate(data, {
      onSuccess: () => setImageModal(null),
    });
  };

  const handleSaveUserEdit = (data) => {
    updateUserMutation.mutate(data, {
      onSuccess: () => setUserModal(null),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {roomsError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Failed to load rooms
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{roomsError.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          roomsCount={roomsData?.rooms?.length}
          imagesCount={imagesData?.images?.length}
          usersCount={usersData?.users?.length}
        />

        {activeTab === "rooms" && (
          <RoomsTab
            roomsData={roomsData}
            loadingRooms={roomsLoading}
            onUpdateRoom={(data) => updateRoomMutation.mutate(data)}
          />
        )}

        {activeTab === "images" && (
          <ImagesTab
            imagesData={imagesData}
            loadingImages={loadingImages}
            onImageUpload={handleImageUpload}
            onBulkUpload={handleBulkImageUpload}
            onEditImage={setImageModal}
            onDeleteImage={(data) => deleteImageMutation.mutate(data)}
          />
        )}

        {activeTab === "users" && (
          <UsersTab
            usersData={usersData}
            loadingUsers={loadingUsers}
            onEditUser={setUserModal}
            onDeleteUser={(userId) => deleteUserMutation.mutate(userId)}
          />
        )}
      </div>

      <ImageUploadModal
        uploadModal={uploadModal}
        onClose={() => setUploadModal(false)}
        onSave={handleSaveUpload}
        isPending={uploadImageMutation.isPending}
      />

      <BulkUploadModal
        bulkUploadModal={bulkUploadModal}
        roomsData={roomsData}
        onClose={() => {
          setBulkUploadModal(false);
          setBulkUploadProgress(null);
        }}
        onSave={handleSaveBulkUpload}
        isPending={bulkUploadMutation.isPending}
        progress={bulkUploadProgress}
      />

      <ImageEditModal
        imageModal={imageModal}
        onClose={() => setImageModal(null)}
        onSave={handleSaveImageEdit}
        isPending={updateImageMutation.isPending}
      />

      <UserEditModal
        userModal={userModal}
        onClose={() => setUserModal(null)}
        onSave={handleSaveUserEdit}
        isPending={updateUserMutation.isPending}
      />
    </div>
  );
}
