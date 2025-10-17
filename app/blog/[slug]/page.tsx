'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  MessageSquare, 
  Clock,
  Share2,
  BookOpen,
  ArrowLeft,
  Star
} from 'lucide-react';
import apiRequest from '@/lib/api';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  };
  featuredImage: {
    url: string;
    alt?: string;
    caption?: string;
  };
  media: Array<{
    type: 'image' | 'video';
    url: string;
    alt?: string;
    caption?: string;
    thumbnail?: string;
    duration?: number;
    order: number;
  }>;
  categories: string[];
  tags: string[];
  status: string;
  featured: boolean;
  views: number;
  likeCount: number;
  commentCount: number;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  relatedPosts: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: {
      url: string;
      alt?: string;
    };
    publishedAt: string;
  }>;
}

interface Comment {
  _id: string;
  author: {
    name: string;
    email: string;
    website?: string;
    userId?: string;
  };
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parentComment?: string;
  replies: string[];
  createdAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Comment form state removed - display only
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.slug) {
      fetchBlogPost(params.slug as string);
    }
  }, [params.slug]);

  // Comment form update effect removed

  const fetchBlogPost = async (slug: string) => {
    try {
      setLoading(true);
      const data = await apiRequest(`/blog/${slug}`);

      if (data.success) {
        setBlog(data.data);
        setLikeCount(data.data.likeCount || 0);
        
        // Check if user has liked this post (if authenticated)
        if (user) {
          // You would typically check this from the backend
          // For now, we'll assume it's not liked
          setLiked(false);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Blog post not found',
          variant: 'destructive'
        });
        router.push('/blog');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post',
        variant: 'destructive'
      });
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to like posts',
        variant: 'destructive'
      });
      return;
    }

    try {
      const data = await apiRequest(`/blog/${blog?.slug}/like`, {
        method: 'POST'
      });

      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        toast({
          title: data.liked ? 'Post Liked' : 'Like Removed',
          description: data.message
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'Blog post link copied to clipboard'
    });
  };

  // Comment submission removed - display only

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadingTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  const renderMedia = (mediaItem: BlogPost['media'][0]) => {
    if (mediaItem.type === 'image') {
      return (
        <div key={mediaItem.url} className="my-8">
          <div className="relative w-full h-96">
            <Image
              src={mediaItem.url}
              alt={mediaItem.alt || 'Blog image'}
              fill
              className="object-contain rounded-lg"
            />
          </div>
          {mediaItem.caption && (
            <p className="text-center text-sm text-gray-600 mt-2 italic">
              {mediaItem.caption}
            </p>
          )}
        </div>
      );
    } else if (mediaItem.type === 'video') {
      return (
        <div key={mediaItem.url} className="my-8">
          <div className="relative w-full aspect-video">
            <video
              controls
              className="w-full h-full rounded-lg"
              poster={mediaItem.thumbnail}
            >
              <source src={mediaItem.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {mediaItem.caption && (
            <p className="text-center text-sm text-gray-600 mt-2 italic">
              {mediaItem.caption}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-teal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-teal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h1>
            <Link href="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-teal">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Main Article */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Featured Image */}
          <div className="relative h-64 md:h-96">
            <Image
              src={blog.featuredImage.url}
              alt={blog.featuredImage.alt || blog.title}
              fill
              className="object-cover"
            />
            {blog.featured && (
              <div className="absolute top-6 left-6">
                <Badge className="bg-yellow-500 text-yellow-900 text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories.map((category, index) => (
                <Badge key={index} variant="secondary">{category}</Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{blog.author.firstName} {blog.author.lastName}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{formatReadingTime(blog.readingTime)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>{blog.views.toLocaleString()} views</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b">
              <div className="flex items-center space-x-4">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center space-x-2"
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageSquare className="h-4 w-4" />
                <span>{blog.commentCount} comments</span>
              </div>
            </div>

            {/* Content */}
            <div 
              ref={contentRef}
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Media Gallery */}
            {blog.media && blog.media.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Media</h3>
                {blog.media
                  .sort((a, b) => a.order - b.order)
                  .map(renderMedia)}
              </div>
            )}

            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Author Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${blog.author.firstName}+${blog.author.lastName}&background=random`} />
                <AvatarFallback>
                  {blog.author.firstName[0]}{blog.author.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {blog.author.firstName} {blog.author.lastName}
                </h3>
                <p className="text-gray-600 mb-2">@{blog.author.username}</p>
                <p className="text-sm text-gray-500">
                  Content creator and blogger sharing insights about various topics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts */}
        {blog.relatedPosts && blog.relatedPosts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Related Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blog.relatedPosts.map((post) => (
                  <Link key={post._id} href={`/blog/${post.slug}`}>
                    <div className="flex space-x-4 p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={post.featuredImage.url}
                          alt={post.featuredImage.alt || post.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post.excerpt}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(post.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Comments ({blog.commentCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Comments Display */}
            <div className="space-y-6">
              {blog.commentCount > 0 ? (
                <p className="text-gray-600">
                  Comments are displayed after moderation approval.
                </p>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
              
              {/* Future: Display approved comments here */}
              {/* This section would show actual comments from the backend when they exist */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
