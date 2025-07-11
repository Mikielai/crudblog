"use client";

import Container from "@/components/container";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPost } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreatePage() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {userId, isLoaded, isSignedIn} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try{
      if(!userId){
        toast.error("User ID is required to create a post");
        return;
      }
      
      const result = await createPost({title, content, image});
      if (result.success) {
        toast.success("Post published successfully!");
        router.push("/");
      } else {
        toast.error(`Failed to create post: ${result.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An unexpected error occurred while creating the post");
    } finally {
      setIsSubmitting(false);
    }
  }
    return (
        <Container>
          <div className="mb-6">
            <Link href = "/">
              <Button variant = "outline" size="sm">
                <ArrowLeft className= "mr-4 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
          <form className="max-w-3xl space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2"> 
              <Label htmlFor="title"> Title</Label>
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
              <RichTextEditor content={content} onChange={setContent}>

              </RichTextEditor>
            </div>

            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating post..." : "Create Post"}</Button>
          </form>
            
        </Container>
    );
}