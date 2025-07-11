"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/rich-text-editor";
import ImageUpload from "@/components/ImageUpload";
import { updatePost } from "@/lib/actions";

interface Post {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
}

interface EditPostFormProps {
  post: Post;
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content || "");
  const [image, setImage] = useState(post.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updatePost(post.id, { title, content, image });
      if (result.success) {
        toast.success("Post updated successfully!");
        router.push("/dashboard");
      } else {
        toast.error(`Failed to update post: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An unexpected error occurred while updating the post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="max-w-3xl space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          className="bg-slate-50"
          required
        />
      </div>
      
      <ImageUpload
        value={image}
        onChange={(url) => setImage(url || "")}
        disabled={isSubmitting}
      />
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating post..." : "Update Post"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}