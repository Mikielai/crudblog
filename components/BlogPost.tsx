import Image from "next/image";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns/formatDistanceToNow";



interface BlogPostProps {
  post: {
    id: string;
    title: string;
    content: string | null;
    image: string | null;
    createdAt: Date;
    author: {
      firstName: string | null;
      lastName: string | null;
      profileimage: string | null;
    };
    _count?: {
      comments: number;
    };
  };
}

export default function BlogPost({ post }: BlogPostProps) {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Link>
      </div>

      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {post.author.profileimage && (
            <Image
              src={post.author.profileimage}
              alt={`${post.author.firstName} ${post.author.lastName}`}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span>
            {post.author.firstName} {post.author.lastName}
          </span>
          <span>•</span>
          <time>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </time>
        </div>
      </header>

      {/* Featured Image */}
      {post.image && (
        <div className="mb-8">
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg object-cover"
            priority
          />
        </div>
      )}

      {/* Post Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
    </article>
  );
}