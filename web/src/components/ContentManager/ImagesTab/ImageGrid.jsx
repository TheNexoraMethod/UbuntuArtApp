import { ImageCard } from "./ImageCard";

export function ImageGrid({ images, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <ImageCard
          key={`${image.source}-${image.id}`}
          image={image}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
