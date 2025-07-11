"use client";

import { useState } from "react"; // Remove useEffect from this line
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

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

interface CommentsSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentAdded = () => {
    fetchComments();
  };

  const handleCommentDeleted = () => {
    fetchComments();
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>
      
      <div className="mb-8">
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      ) : (
        <CommentList 
          comments={comments} 
          onCommentDeleted={handleCommentDeleted} 
        />
      )}
    </div>
  );
}
