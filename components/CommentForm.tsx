"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isSignedIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createComment(postId, content.trim());
      
      if (result.success) {
        toast.success("Comment added successfully!");
        setContent("");
        onCommentAdded();
      } else {
        toast.error(`Failed to add comment: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-muted-foreground">Please sign in to leave a comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        placeholder="Write your comment..."
        className="min-h-[100px]"
        maxLength={1000}
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {content.length}/1000 characters
        </span>
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Adding..." : "Add Comment"}
        </Button>
      </div>
    </form>
  );
}
