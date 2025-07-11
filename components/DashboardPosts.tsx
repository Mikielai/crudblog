"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Edit, Eye, MessageCircle, ArrowUpDown, Calendar } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import DeletePostButton from "@/components/DeletePostButton";
import PublishToggleButton from "@/components/PublishToggleButton";
import { useState } from "react";

interface Post {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileimage: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  _count?: {
    comments: number;
  };
}

interface DashboardPostsProps {
  posts: Post[];
}

export default function DashboardPosts({ posts }: DashboardPostsProps) {
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
        <p className="text-muted-foreground mb-4">
          Start creating content to see it here
        </p>
        <Link href="/create">
          <Button>Create Your First Post</Button>
        </Link>
      </div>
    );
  }

  // Sort posts based on selected order
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
  });

  // Group posts by date periods
  const groupPostsByDate = (posts: Post[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: Post[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'This Month': [],
      'Older': []
    };

    posts.forEach(post => {
      const postDate = new Date(post.createdAt);
      const postDateOnly = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());

      if (postDateOnly.getTime() === today.getTime()) {
        groups['Today'].push(post);
      } else if (postDateOnly.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(post);
      } else if (postDate > thisWeek) {
        groups['This Week'].push(post);
      } else if (postDate > thisMonth) {
        groups['This Month'].push(post);
      } else {
        groups['Older'].push(post);
      }
    });

    return groups;
  };

  const groupedPosts = groupPostsByDate(sortedPosts);

  return (
    <div className="space-y-8">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Sort by date:</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={sortOrder === 'latest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortOrder('latest')}
            className="gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            Latest
          </Button>
          <Button
            variant={sortOrder === 'oldest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortOrder('oldest')}
            className="gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            Oldest
          </Button>
        </div>
      </div>

      {Object.entries(groupedPosts).map(([period, periodPosts]) => {
        if (periodPosts.length === 0) return null;
        
        return (
          <div key={period}>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">{period}</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {periodPosts.length} post{periodPosts.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid gap-6">
              {periodPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{post.title}</CardTitle>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created {formatDate(post.createdAt)}
                          {post.updatedAt > post.createdAt && (
                            <span> • Updated {formatDate(post.updatedAt)}</span>
                          )}
                          {post._count && post._count.comments > 0 && (
                            <span className="flex items-center gap-1 mt-1">
                              <MessageCircle className="h-3 w-3" />
                              {post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PublishToggleButton postId={post.id} isPublished={post.published} />
                        <Link href={`/posts/${post.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/edit/${post.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground line-clamp-3">
                      {post.content ? 
                        DOMPurify.sanitize(post.content, { ALLOWED_TAGS: [] }).substring(0, 200) + 
                        (post.content.length > 200 ? '...' : '') 
                        : 'No content'
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
