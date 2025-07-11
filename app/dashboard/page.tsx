import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
import DashboardPosts from "@/components/DashboardPosts";

export default async function DashBoard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const posts = await db.post.findMany({
    where: {
      authorId: userId,
    },
    orderBy: {
      createdAt: "desc",
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

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your blog posts and content
          </p>
        </div>
        <Link href="/create">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      <DashboardPosts posts={posts} />
    </Container>
  );
}