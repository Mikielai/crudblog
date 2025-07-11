import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Container from "@/components/container";
import BlogPostList from "@/components/BlogPostList";
import CommentsSection from "@/components/CommentsSection";

// Fix: Update the interface for Next.js 15
interface PostPageProps {
  params: Promise<{ id: string }>; // Changed from { id: string } to Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    // Await the params in Next.js 15
    const { id } = await params;

    const post = await db.post.findUnique({
      where: {
        id: id,
      },
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      notFound();
    }

    // Only show published posts to non-authors
    if (!post.published) {
      notFound();
    }

    return (
      <Container>
        <BlogPostList posts={[post]} />
        <CommentsSection 
          postId={post.id} 
          initialComments={post.comments} 
        />
      </Container>
    );
  } catch (error) {
    console.error("Error fetching post:", error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PostPageProps) {
  try {
    const { id } = await params;
    
    const post = await db.post.findUnique({
      where: { id },
      select: {
        title: true,
        content: true,
      },
    });

    if (!post) {
      return {
        title: 'Post Not Found',
      };
    }

    return {
      title: post.title,
      description: post.content?.substring(0, 160) || 'Read this blog post',
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}
