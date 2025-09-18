'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  BarChart3,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  FileText,
  Calendar,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import apiRequest from '@/lib/api';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  featuredImage: {
    url: string;
    alt?: string;
  };
  categories: string[];
  tags: string[];
  views: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  publishedAt?: string;
  lastModified: string;
}

interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  archivedBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;

  recentBlogs: number;
}

interface BlogFilters {
  status: string;
  author: string;
  search: string;
  sortBy: string;
}

export default function AdminBlogPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState<BlogFilters>({
    status: 'all',
    author: 'all',
    search: '',
    sortBy: 'newest'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // New blog form state
  const [newBlog, setNewBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    categories: [] as string[],
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    featuredImage: {
      url: '',
      alt: '',
      caption: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch blogs and stats in parallel
      const [blogsResponse, statsResponse] = await Promise.all([
        fetchBlogs(),
        fetchStats()
      ]);

      if (blogsResponse.success) {
        setBlogs(blogsResponse.blogs);
        setPagination(blogsResponse.pagination);
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: '20'
    });

    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.author !== 'all') params.append('author', filters.author);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy !== 'newest') params.append('sortBy', filters.sortBy);

    return await apiRequest(`/admin/blog?${params.toString()}`);
  };

  const fetchStats = async () => {
    return await apiRequest('/admin/blog/stats');
  };

  const handleFilterChange = (key: keyof BlogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      author: 'all',
      search: '',
      sortBy: 'newest'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreateBlog = async () => {
    try {
      setCreating(true);

      const response = await apiRequest('/admin/blog', {
        method: 'POST',
        body: JSON.stringify(newBlog)
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Blog post created successfully'
        });
        setShowCreateDialog(false);
        setNewBlog({
          title: '',
          excerpt: '',
          content: '',
          categories: [],
          tags: [],
          status: 'draft',
          featured: false,
          featuredImage: { url: '', alt: '', caption: '' }
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleBlogAction = async (blogId: string, action: 'delete' | 'feature' | 'unfeature') => {
    try {
      if (action === 'delete') {
        await apiRequest(`/admin/blog/${blogId}`, { method: 'DELETE' });
        toast({
          title: 'Success',
          description: 'Blog post deleted successfully'
        });
      } else {
        const blog = blogs.find(b => b._id === blogId);
        if (blog) {
          const updateData = { featured: action === 'feature' };
          await apiRequest(`/admin/blog/${blogId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
          });
          toast({
            title: 'Success',
            description: `Blog post ${action}d successfully`
          });
        }
      }
      fetchData();
    } catch (error) {
      console.error(`Error ${action}ing blog:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} blog post`,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-red-50/30 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Blog Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage blog posts, comments, and content</p>
          </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter blog post title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the blog post"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newBlog.content}
                  onChange={(e) => setNewBlog(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Blog post content"
                  rows={8}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={newBlog.featuredImage.url}
                  onChange={(e) => setNewBlog(prev => ({ 
                    ...prev, 
                    featuredImage: { ...prev.featuredImage, url: e.target.value }
                  }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newBlog.status}
                    onValueChange={(value: 'draft' | 'published' | 'archived') => 
                      setNewBlog(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newBlog.featured}
                    onChange={(e) => setNewBlog(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
              </div>
              <Button onClick={handleCreateBlog} disabled={creating}>
                {creating ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Posts</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalBlogs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Published</p>
                    <p className="text-2xl font-bold text-green-800">{stats.publishedBlogs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-800">{stats.draftBlogs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-700">Featured</p>
                    <p className="text-2xl font-bold text-purple-800">{blogs.filter(b => b.featured).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Total Views</p>
                    <p className="text-2xl font-bold text-indigo-800">{stats.totalViews.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Total Likes</p>
                    <p className="text-2xl font-bold text-red-800">{stats.totalLikes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-700">Comments</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.totalComments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-teal-700">Recent</p>
                    <p className="text-2xl font-bold text-teal-800">{stats.recentBlogs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="modified">Recently Modified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Blog Posts Table */}
        <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Author</TableHead>
                  <TableHead className="hidden md:table-cell">Stats</TableHead>
                  <TableHead className="hidden lg:table-cell">Dates</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog._id}>
                    <TableCell>
                      <div className="flex items-start space-x-3">
                        <img
                          src={blog.featuredImage.url || '/placeholder.jpg'}
                          alt={blog.featuredImage.alt || blog.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 line-clamp-1">{blog.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2">{blog.excerpt}</p>
                          {blog.featured && (
                            <Badge variant="outline" className="mt-1">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(blog.status)}>
                        {blog.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div>
                        <p className="font-medium">
                          {blog.author.firstName} {blog.author.lastName}
                        </p>
                        <p className="text-sm text-gray-500">@{blog.author.username}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {blog.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {blog.likeCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {blog.commentCount}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1 text-sm">
                        <p>Created: {formatDate(blog.createdAt)}</p>
                        {blog.publishedAt && (
                          <p>Published: {formatDate(blog.publishedAt)}</p>
                        )}
                        <p>Modified: {formatDate(blog.lastModified)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBlog(blog);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/blog/${blog._id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlogAction(blog._id, blog.featured ? 'unfeature' : 'feature')}
                        >
                          <Star className={`h-4 w-4 ${blog.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this blog post?')) {
                              handleBlogAction(blog._id, 'delete');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * 20) + 1} to {Math.min(pagination.page * 20, pagination.total)} of {pagination.total} posts
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Blog Post Details</DialogTitle>
          </DialogHeader>
          {selectedBlog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <p className="text-sm font-medium">{selectedBlog.title}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedBlog.status)}>
                    {selectedBlog.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Excerpt</Label>
                <p className="text-sm text-gray-600">{selectedBlog.excerpt}</p>
              </div>
              <div>
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedBlog.categories.map((category, index) => (
                    <Badge key={index} variant="outline">{category}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedBlog.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Views</Label>
                  <p className="text-sm font-medium">{selectedBlog.views.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Likes</Label>
                  <p className="text-sm font-medium">{selectedBlog.likeCount}</p>
                </div>
                <div>
                  <Label>Comments</Label>
                  <p className="text-sm font-medium">{selectedBlog.commentCount}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
