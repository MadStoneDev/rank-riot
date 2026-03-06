"use client";

import { useState } from "react";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";
import { deleteScan } from "@/app/(private)/projects/actions";
import { toast } from "sonner";

interface DeleteScanButtonProps {
  id: string;
  onDelete: (id: string) => void;
}

export default function DeleteScanButton({
  id,
  onDelete,
}: DeleteScanButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteScan = async (scanId: string) => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const result = await deleteScan(scanId);

      if (result.error) {
        toast.error(result.error);
        setIsDeleting(false);
      } else {
        toast.success("Scan deleted successfully");
        onDelete(scanId);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Delete scan error:", error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={() => handleDeleteScan(id)}
      disabled={isDeleting}
      className={`
        cursor-pointer
        mr-2
        lg:mr-0
        grid
        place-content-center
        w-[50px]
        h-[50px]
        lg:h-auto
        lg:max-w-0
        lg:group-hover/scan:max-w-12
        bg-red-100
        hover:bg-red-200
        rounded-full
        lg:rounded-none
        text-red-600
        overflow-hidden
        transition-all
        duration-300
        ease-in-out
        ${isDeleting ? "animate-pulse" : ""}
      `}
      aria-label="Delete scan"
    >
      {isDeleting ? <IconLoader2 className="animate-spin" /> : <IconTrash />}
    </button>
  );
}
