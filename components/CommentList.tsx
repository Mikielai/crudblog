"use client";

import { Button } from "@/components/ui/button";
import { deleteComment } from "@/lib/actions";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EditCommentForm from "./EditCommentForm";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileimage: string | null;
  };
}

interface CommentListProps {
  comments: Comment[];
  onCommentDeleted: () => void;
}

export default function CommentList({ comments, onCommentDeleted }: CommentListProps) {
  const { userId } = useAuth();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (commentId: string) => {
    setEditingId(commentId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = () => {
    setEditingId(null);
    onCommentDeleted(); // Refresh comments to show updated content
  };

  const handleDelete = async (commentId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;

    setDeletingIds(prev => new Set(prev).add(commentId));
    try {
      const result = await deleteComment(commentId);
      
      if (result.success) {
        toast.success("Comment deleted successfully!");
        onCommentDeleted();
      } else {
        toast.error(`Failed to delete comment: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {comment.author.profileimage && (
                <img
                  src={comment.author.profileimage}
                  alt={`${comment.author.firstName} ${comment.author.lastName}`}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <span className="font-medium">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                <div className="text-sm text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
            </div>
            
            {userId === comment.author.id && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(comment.id)}
                  disabled={editingId === comment.id}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingIds.has(comment.id) || editingId === comment.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {editingId === comment.id ? (
            <EditCommentForm
              commentId={comment.id}
              initialContent={comment.content}
              onCancel={handleCancelEdit}
              onSave={handleSaveEdit}
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
