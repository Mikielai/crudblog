"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import React, { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import { MessageCircle, ArrowUpDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  published: boolean;
  createdAt: Date;
  authorId: string;
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

interface BlogPostListProps {
  posts: Post[];
}

export default function BlogPostList({ posts }: BlogPostListProps) {
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to create one!</p>
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
                        
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {periodPosts.map((post) => (
                                <Link key={post.id} href={`/posts/${post.id}`} className="block">
                                    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                                        {post.image && (
                                            <div className="aspect-video overflow-hidden rounded-t-lg">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <CardHeader>
                                            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                                {post.content ? DOMPurify.sanitize(post.content, {
                                                    ALLOWED_TAGS: []
                                                }).substring(0, 150) + (post.content.length > 150 ? '...' : '') : 'No content'}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="text-sm text-muted-foreground">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    <span>{post.author.firstName} {post.author.lastName}</span>
                                                    <span>•</span>
                                                    <time dateTime={post.createdAt.toISOString()}>
                                                        {formatDate(post.createdAt)}
                                                    </time>
                                                </div>
                                                {post._count && (
                                                    <div className="flex items-center gap-1">
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>{post._count.comments}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}