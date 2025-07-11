"use client";

import Container from "@/components/container";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePost } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface EditPageProps {
  params: {
    id: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  authorId: string;
}

export default function EditPage({ params }: EditPageProps) {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [post, setPost] = useState<Post | null>(null);
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const postData = await response.json();
        
        // Check if user owns this post
        if (postData.authorId !== userId) {
          toast.error("You don't have permission to edit this post");
          router.push("/dashboard");
          return;
        }
        
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content || "");
        setImage(postData.image || "");
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error("Post not found");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && params.id) {
      fetchPost();
    }
  }, [userId, params.id, router]);

  if (!isLoaded || isLoading) {
    return (
      <Container>
        <div className="text-center py-12">
          <p>Loading...</p>
        </div>
      </Container>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!userId) {
        toast.error("User ID is required to update a post");
        return;
      }

      if (!post) {
        toast.error("Post not found");
        return;
      }

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
    <Container>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>•</span>
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <span>•</span>
        <span>Edit Post</span>
      </div>
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
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
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </Container>
  );
}
