"use client";

import { useState } from "react";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
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
    const supabase = createClient();

    try {
      // Delete the scan from the database
      const { error } = await supabase.from("scans").delete().eq("id", scanId);

      if (error) {
        toast.error(error.message || "Failed to delete scan");
        setIsDeleting(false);
      } else {
        // Show success toast
        toast.success("Scan deleted successfully");

        // This is the crucial step - we tell the parent (ScanHistoryItem)
        // that deletion was successful so it can start the animation
        console.log(
          "DeleteScanButton: DB deletion successful, calling onDelete",
        );
        onDelete(scanId);

        // We don't reset isDeleting here because the button will be removed anyway
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
