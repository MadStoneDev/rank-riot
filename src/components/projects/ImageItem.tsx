"use client";

import { IconPhoto } from "@tabler/icons-react";

export default function ImageItem({
  image,
  index,
}: {
  image: any;
  index: number;
}) {
  return (
    <div key={index} className={`p-4 flex items-start`}>
      <div className={`mt-1 flex-shrink-0 rounded-full p-1 text-primary-500`}>
        <IconPhoto />
      </div>
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium text-neutral-900">
          {index + 1}. {image.src}
        </h4>
        <p className="mt-1 text-sm text-neutral-500">
          <span className={`font-bold`}>Alt Text:</span> {image.alt}
        </p>
      </div>
    </div>
  );
}
