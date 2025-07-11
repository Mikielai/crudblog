"use client";

import { Button } from "@/components/ui/button";
import { deletePost } from "@/lib/actions";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export default function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deletePost(postId);
      
      if (result.success) {
        toast.success("Post deleted successfully!");
        router.refresh(); // Refresh the current page to update the list
      } else {
        toast.error(`Failed to delete post: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("An unexpected error occurred while deleting the post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting && <span className="ml-1">...</span>}
    </Button>
  );
}
