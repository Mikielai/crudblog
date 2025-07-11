import { db } from "@/lib/db";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import CommentsSection from "@/components/CommentsSection";

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await db.post.findUnique({
    where: {
      id: params.id,
    },
    include: {
      author: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileimage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <Container>
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
        </Link>
      </div>

      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              {post.author.profileimage && (
                <img
                  src={post.author.profileimage}
                  alt={`${post.author.firstName} ${post.author.lastName}`}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="font-medium">
                {post.author.firstName} {post.author.lastName}
              </span>
            </div>
            <span>•</span>
            <time dateTime={post.createdAt.toISOString()}>
              {formatDate(post.createdAt)}
            </time>
          </div>
        </header>

        {post.image && (
          <div className="mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {post.content ? (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content, {
                  ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'
                  ],
                  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
                })
              }}
            />
          ) : (
            <p className="text-muted-foreground italic">No content available.</p>
          )}
        </div>

        <CommentsSection 
          postId={post.id} 
          initialComments={post.comments || []} 
        />
      </article>
    </Container>
  );
}
