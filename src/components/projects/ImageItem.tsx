"use client";

import { IconExternalLink, IconPhoto } from "@tabler/icons-react";
import Link from "next/link";

export default function ImageItem({
  image,
  index,
}: {
  image: any;
  index: number;
}) {
  return (
    <div
      key={index}
      className={`group/image flex-1 relative flex items-stretch `}
    >
      <div className={`mt-1 p-4 flex-shrink-0 rounded-full p-1 text-primary`}>
        <IconPhoto />
      </div>
      <div className={`ml-3 py-4 flex-1`}>
        <h4 className="text-sm font-medium text-neutral-900">
          {index + 1}. {image.src}
        </h4>
        <p className="mt-1 text-sm text-neutral-500">
          <span className={`font-bold`}>Alt Text:</span> {image.alt}
        </p>

        <Link
          href={image.src}
          target={`_blank`}
          className={`mt-2 pt-1 flex items-center w-fit border-t border-neutral-300 text-sm text-primary hover:text-primary/70 transition-all duration-300 ease-in-out`}
        >
          See Full Image
          <IconExternalLink size={20} className={`ml-1`} />
        </Link>
      </div>

      <div
        className={`lg:group-hover/image:px-4 grid place-content-center w-40 max-w-0 lg:group-hover/image:max-w-[150px] overflow-hidden transition-all duration-500 ease-in-out`}
      >
        <img
          src={image.src}
          alt={image.alt}
          className={`my-4 flex-1 h-20 min-w-40 object-cover`}
        />
      </div>
    </div>
  );
}
