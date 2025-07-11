
import Image from "next/image";
import { db } from '@/lib/db'
import { syncUserUpsert } from '@/lib/sync-user-upsert'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import BlogPostList from "@/components/BlogPostList";
import Container from "@/components/container";

export default async function Home() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const posts = await db.post.findMany({
      where: {
        published: true, // Only show published posts on homepage
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    console.log('Posts found:', posts.length);

    return (
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Latest Posts</h1>
          <p className="text-muted-foreground mt-2">
            Explore the latest articles and insights
          </p>
        </div>

        <BlogPostList posts={posts} />
      </Container>
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    return (
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Latest Posts</h1>
          <p className="text-muted-foreground mt-2">
            Explore the latest articles and insights
          </p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load posts. Please try again later.</p>
        </div>
      </Container>
    );
  }
}
