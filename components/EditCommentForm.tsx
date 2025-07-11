"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateComment } from "@/lib/actions";
import { X, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EditCommentFormProps {
  commentId: string;
  initialContent: string;
  onCancel: () => void;
  onSave: () => void;
}

export default function EditCommentForm({ 
  commentId, 
  initialContent, 
  onCancel, 
  onSave 
}: EditCommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (content.trim() === initialContent.trim()) {
      // No changes made
      onCancel();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateComment(commentId, content.trim());
      
      if (result.success) {
        toast.success("Comment updated successfully!");
        onSave();
      } else {
        toast.error(`Failed to update comment: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        className="min-h-[80px]"
        maxLength={1000}
        autoFocus
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {content.length}/1000 characters
        </span>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            size="sm" 
            disabled={isSubmitting || !content.trim()}
          >
            <Check className="h-3 w-3 mr-1" />
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
