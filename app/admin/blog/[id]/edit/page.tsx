'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, Trash2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import apiRequest from '@/lib/api';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: {
    url: string;
    alt: string;
    caption: string;
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
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'password_protected';
  featured: boolean;
  allowComments: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
}

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: {
      url: '',
      alt: '',
      caption: ''
    },
    categories: [] as string[],
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    visibility: 'public' as 'public' | 'private' | 'password_protected',
    featured: false,
    allowComments: true,
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [] as string[]
    }
  });

  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchBlog(params.id as string);
    }
  }, [params.id]);

  const fetchBlog = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiRequest(`/admin/blog/${id}`);
      
      if (response.success) {
        const blogData = response.data;
        setBlog(blogData);
        setFormData({
          title: blogData.title || '',
          excerpt: blogData.excerpt || '',
          content: blogData.content || '',
          featuredImage: {
            url: blogData.featuredImage?.url || '',
            alt: blogData.featuredImage?.alt || '',
            caption: blogData.featuredImage?.caption || ''
          },
          categories: blogData.categories || [],
          tags: blogData.tags || [],
          status: blogData.status || 'draft',
          visibility: blogData.visibility || 'public',
          featured: blogData.featured || false,
          allowComments: blogData.allowComments !== false,
          seo: {
            metaTitle: blogData.seo?.metaTitle || '',
            metaDescription: blogData.seo?.metaDescription || '',
            metaKeywords: blogData.seo?.metaKeywords || []
          }
        });
      } else {
        toast({
          title: 'Error',
          description: 'Blog post not found',
          variant: 'destructive'
        });
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post',
        variant: 'destructive'
      });
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      const response = await apiRequest(`/admin/blog/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Blog post updated successfully'
        });
        router.push('/admin/blog');
      } else {
        throw new Error(response.message || 'Failed to update blog post');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to save blog post',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiRequest(`/admin/blog/${params.id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Blog post deleted successfully'
        });
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive'
      });
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.toLowerCase().trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.toLowerCase().trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.toLowerCase().trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.toLowerCase().trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.seo.metaKeywords.includes(newKeyword.toLowerCase().trim())) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          metaKeywords: [...prev.seo.metaKeywords, newKeyword.toLowerCase().trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        metaKeywords: prev.seo.metaKeywords.filter(k => k !== keyword)
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600 mt-1">Update your blog post content and settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {blog && (
            <Link href={`/blog/${blog.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter blog post title"
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the blog post"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Blog post content (supports HTML)"
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting. Supports images, videos, and rich formatting.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="featuredImageUrl">Image URL *</Label>
                <Input
                  id="featuredImageUrl"
                  value={formData.featuredImage.url}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    featuredImage: { ...prev.featuredImage, url: e.target.value }
                  }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="featuredImageAlt">Alt Text</Label>
                  <Input
                    id="featuredImageAlt"
                    value={formData.featuredImage.alt}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      featuredImage: { ...prev.featuredImage, alt: e.target.value }
                    }))}
                    placeholder="Descriptive alt text"
                  />
                </div>
                
                <div>
                  <Label htmlFor="featuredImageCaption">Caption</Label>
                  <Input
                    id="featuredImageCaption"
                    value={formData.featuredImage.caption}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      featuredImage: { ...prev.featuredImage, caption: e.target.value }
                    }))}
                    placeholder="Image caption"
                  />
                </div>
              </div>

              {formData.featuredImage.url && (
                <div className="mt-4">
                  <img 
                    src={formData.featuredImage.url} 
                    alt="Featured image preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.seo.metaTitle}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, metaTitle: e.target.value }
                  }))}
                  placeholder="SEO-optimized title (60 chars max)"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seo.metaTitle.length}/60 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.seo.metaDescription}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, metaDescription: e.target.value }
                  }))}
                  placeholder="SEO-optimized description (160 chars max)"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seo.metaDescription.length}/160 characters
                </p>
              </div>
              
              <div>
                <Label>Meta Keywords</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.seo.metaKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    setFormData(prev => ({ ...prev, status: value }))
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

              <div>
                <Label>Visibility</Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value: 'public' | 'private' | 'password_protected') => 
                    setFormData(prev => ({ ...prev, visibility: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="password_protected">Password Protected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <Label htmlFor="featured">Featured Post</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowComments"
                  checked={formData.allowComments}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <Label htmlFor="allowComments">Allow Comments</Label>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-3">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add category"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                />
                <Button type="button" onClick={addCategory} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category, index) => (
                  <Badge key={index} variant="secondary">
                    {category}
                    <button
                      onClick={() => removeCategory(category)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
