"use client";

import { Button } from "@/components/ui/button";
import { togglePublishPost } from "@/lib/actions";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface PublishToggleButtonProps {
  postId: string;
  isPublished: boolean;
}

export default function PublishToggleButton({ postId, isPublished }: PublishToggleButtonProps) {
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const result = await togglePublishPost(postId);
      
      if (result.success) {
        toast.success(result.isPublished ? "Post published!" : "Post unpublished");
        router.refresh(); // Refresh the current page to update the status
      } else {
        toast.error(`Failed to update post: ${result.message}`);
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isToggling}
      className={isPublished ? "text-green-600 hover:text-green-700" : "text-gray-600 hover:text-gray-700"}
    >
      {isPublished ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
      {isToggling ? "..." : (isPublished ? "Published" : "Draft")}
    </Button>
  );
}
