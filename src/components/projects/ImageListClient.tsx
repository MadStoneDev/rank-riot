"use client";

import { IconPhoto } from "@tabler/icons-react";
import PaginatedList from "@/components/projects/PaginatedListBlock";
import ImageItem from "@/components/projects/ImageItem";

type ImageProp = {
  src: string;
  alt: string;
};

export default function ImageListClient({ images }: { images: ImageProp[] }) {
  // Define the render function within the client component
  const renderImageItem = (image: ImageProp, index: number) => (
    <ImageItem key={index} image={image} index={index} />
  );

  return (
    <PaginatedList
      title="Images"
      items={images}
      itemType="image"
      renderItem={renderImageItem}
      itemsPerPage={10}
    />
  );
}
