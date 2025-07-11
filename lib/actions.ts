'use server'

import { db } from "@/lib/db";
import { CreatePostInput } from "./types";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function createPost(data: CreatePostInput) {
   try{
    const { userId } = await auth();
    const user = await currentUser();

    console.log('createPost called with:', { userId, userEmail: user?.emailAddresses[0]?.emailAddress });

    if(!userId || !user){
        console.log('Authentication failed:', { userId: !!userId, user: !!user });
        return { success: false, message: 'User not authenticated' };
    }

    // Check if user exists in database, if not create them
    let dbUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      console.log('User not found in database, creating user:', userId);
      
      // First check if a user with this email already exists
      const existingUserByEmail = await db.user.findUnique({
        where: { email: user.emailAddresses[0]?.emailAddress || '' }
      });
      
      if (existingUserByEmail) {
        console.log('User exists with different ID, using existing user:', existingUserByEmail.id);
        dbUser = existingUserByEmail;
      } else {
        try {
          dbUser = await db.user.create({
            data: {
              id: userId,
              email: user.emailAddresses[0]?.emailAddress || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              profileimage: user.imageUrl || '',
            }
          });
          console.log('User created in database:', dbUser.id);
        } catch (userError: any) {
          console.error('Error creating user:', userError);
          return { success: false, message: `Failed to create user in database: ${userError.message || 'Unknown database error'}` };
        }
      }
    } else {
      console.log('User found in database:', dbUser.id);
    }

    console.log('Creating post for user:', userId);
    const post = await db.post.create({
        data: {
            title: data.title,
            content: data.content,
            image: data.image,
            authorId: userId,
            published: true // Create as published by default
        }
    });
    
    console.log('Post created successfully:', post.id);
    return { success: true, post };

   }catch (error) {
      console.error('Error creating post:', error);
      return { success: false, message: `Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}` };
   }
}

export async function updatePost(postId: string, data: CreatePostInput) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    console.log('updatePost called with:', { userId, postId });

    if (!userId || !user) {
      console.log('Authentication failed:', { userId: !!userId, user: !!user });
      return { success: false, message: 'User not authenticated' };
    }

    // Check if post exists and user owns it
    const existingPost = await db.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return { success: false, message: 'Post not found' };
    }

    if (existingPost.authorId !== userId) {
      return { success: false, message: 'You do not have permission to edit this post' };
    }

    console.log('Updating post:', postId);
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        content: data.content,
        image: data.image,
      }
    });
    
    console.log('Post updated successfully:', updatedPost.id);
    return { success: true, post: updatedPost };

  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, message: `Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function deletePost(postId: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    console.log('deletePost called with:', { userId, postId });

    if (!userId || !user) {
      console.log('Authentication failed:', { userId: !!userId, user: !!user });
      return { success: false, message: 'User not authenticated' };
    }

    // Check if post exists and user owns it
    const existingPost = await db.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return { success: false, message: 'Post not found' };
    }

    if (existingPost.authorId !== userId) {
      return { success: false, message: 'You do not have permission to delete this post' };
    }

    console.log('Deleting post:', postId);
    await db.post.delete({
      where: { id: postId }
    });
    
    console.log('Post deleted successfully:', postId);
    return { success: true, message: 'Post deleted successfully' };

  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, message: `Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function togglePublishPost(postId: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    console.log('togglePublishPost called with:', { userId, postId });

    if (!userId || !user) {
      return { success: false, message: 'User not authenticated' };
    }

    // Check if post exists and user owns it
    const existingPost = await db.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return { success: false, message: 'Post not found' };
    }

    if (existingPost.authorId !== userId) {
      return { success: false, message: 'You do not have permission to modify this post' };
    }

    console.log('Toggling publish status for post:', postId);
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: {
        published: !existingPost.published,
      }
    });
    
    console.log('Post publish status updated:', updatedPost.id, updatedPost.published);
    return { success: true, post: updatedPost, isPublished: updatedPost.published };

  } catch (error) {
    console.error('Error toggling post publish status:', error);
    return { success: false, message: `Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    console.log('createComment called with:', { userId, postId });

    if (!userId || !user) {
      return { success: false, message: 'User not authenticated' };
    }

    // Ensure user exists in database
    let dbUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: userId,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          profileimage: user.imageUrl || '',
        }
      });
    }

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    console.log('Creating comment for post:', postId);
    const comment = await db.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
      },
      include: {
        author: true,
      }
    });
    
    console.log('Comment created successfully:', comment.id);
    return { success: true, comment };

  } catch (error) {
    console.error('Error creating comment:', error);
    return { success: false, message: `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }

    // Check if comment exists and user owns it
    const existingComment = await db.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return { success: false, message: 'Comment not found' };
    }

    if (existingComment.authorId !== userId) {
      return { success: false, message: 'You do not have permission to delete this comment' };
    }

    await db.comment.delete({
      where: { id: commentId }
    });
    
    return { success: true, message: 'Comment deleted successfully' };

  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, message: `Failed to delete comment: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function updateComment(commentId: string, content: string) {
  try {
    const { userId } = await auth();

    console.log('updateComment called with:', { userId, commentId });

    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }

    // Check if comment exists and user owns it
    const existingComment = await db.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return { success: false, message: 'Comment not found' };
    }

    if (existingComment.authorId !== userId) {
      return { success: false, message: 'You do not have permission to edit this comment' };
    }

    console.log('Updating comment:', commentId);
    const updatedComment = await db.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
      },
      include: {
        author: true,
      }
    });
    
    console.log('Comment updated successfully:', updatedComment.id);
    return { success: true, comment: updatedComment };

  } catch (error) {
    console.error('Error updating comment:', error);
    return { success: false, message: `Failed to update comment: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
