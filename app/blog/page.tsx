'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  MessageSquare, 
  Clock,
  Star,
  ArrowRight,
  Filter,
  Grid,
  List
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
  };
  featuredImage: {
    url: string;
    alt?: string;
    caption?: string;
  };
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
}

interface BlogFilters {
  search: string;
  category: string;
  tag: string;
  sortBy: string;
  featured: string;
}

export default function BlogPage() {
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{name: string; count: number}[]>([]);
  const [tags, setTags] = useState<{name: string; count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<BlogFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    tag: searchParams.get('tag') || 'all',
    sortBy: searchParams.get('sortBy') || 'newest',
    featured: searchParams.get('featured') || 'all'
  });

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [blogsResponse, featuredResponse, categoriesResponse, tagsResponse] = await Promise.all([
        fetchBlogs(),
        fetchFeaturedBlogs(),
        fetchCategories(),
        fetchTags()
      ]);

      if (blogsResponse.success) {
        setBlogs(blogsResponse.data);
        setPagination({
          page: blogsResponse.page,
          pages: blogsResponse.pages,
          total: blogsResponse.total
        });
      }

      if (featuredResponse.success) {
        setFeaturedBlogs(featuredResponse.data);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      if (tagsResponse.success) {
        setTags(tagsResponse.data.slice(0, 20)); // Limit to 20 tags
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: '12'
    });

    if (filters.search) params.append('search', filters.search);
    if (filters.category !== 'all') params.append('category', filters.category);
    if (filters.tag !== 'all') params.append('tag', filters.tag);
    if (filters.featured !== 'all') params.append('featured', filters.featured);
    if (filters.sortBy !== 'newest') params.append('sortBy', filters.sortBy);

    return await apiRequest(`/blog?${params.toString()}`);
  };

  const fetchFeaturedBlogs = async () => {
    return await apiRequest('/blog/featured');
  };

  const fetchCategories = async () => {
    return await apiRequest('/blog/categories');
  };

  const fetchTags = async () => {
    return await apiRequest('/blog/tags');
  };

  const handleFilterChange = (key: keyof BlogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      tag: 'all',
      sortBy: 'newest',
      featured: 'all'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

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

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Amazing Stories
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Explore our collection of insightful articles, tutorials, and stories
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Posts */}
        {featuredBlogs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Posts</h2>
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBlogs.slice(0, 3).map((post) => (
                <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={post.featuredImage.url}
                      alt={post.featuredImage.alt || post.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatReadingTime(post.readingTime)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likeCount}
                        </span>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="outline" size="sm">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category
                    </label>
                    <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name} ({category.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tag
                    </label>
                    <Select value={filters.tag} onValueChange={(value) => handleFilterChange('tag', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        {tags.map((tag) => (
                          <SelectItem key={tag.name} value={tag.name}>
                            #{tag.name} ({tag.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sort By
                    </label>
                    <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Featured
                    </label>
                    <Select value={filters.featured} onValueChange={(value) => handleFilterChange('featured', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Posts</SelectItem>
                        <SelectItem value="true">Featured Only</SelectItem>
                        <SelectItem value="false">Regular Posts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                All Posts ({pagination.total})
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Blog Posts */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((post) => (
                  <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        fill
                        className="object-cover"
                      />
                      {post.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.categories.slice(0, 2).map((category, index) => (
                          <Badge key={index} variant="secondary">{category}</Badge>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author.firstName} {post.author.lastName}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatReadingTime(post.readingTime)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likeCount}
                          </span>
                        </div>
                        <Link href={`/blog/${post.slug}`}>
                          <Button variant="outline" size="sm">
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {blogs.map((post) => (
                  <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="relative w-48 h-32 flex-shrink-0">
                          <Image
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt || post.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.categories.slice(0, 3).map((category, index) => (
                              <Badge key={index} variant="secondary">{category}</Badge>
                            ))}
                            {post.featured && (
                              <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {post.author.firstName} {post.author.lastName}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(post.publishedAt)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatReadingTime(post.readingTime)}
                              </div>
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {post.views}
                              </span>
                            </div>
                            <Link href={`/blog/${post.slug}`}>
                              <Button variant="outline">
                                Read More
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                  if (pageNum > pagination.pages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* No Results */}
            {blogs.length === 0 && !loading && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
