"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  Building,
  Flag,
  CheckSquare,
  Settings,
  Briefcase,
  GraduationCap,
  BarChart3,
  Menu,
  Shield,
  LogOut,
  User,
  Bell,
  ChevronDown,
  Megaphone,
  Wallet,
  FileText,
  MessageSquare,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/admin',
    exact: true
  },
  {
    title: 'User Management',
    icon: Users,
    href: '/admin/users'
  },
  {
    title: 'Listings',
    icon: Building,
    items: [
      { title: 'All Listings', href: '/admin/listings' },
      { title: 'Pending Approval', href: '/admin/listings/pending' },
      { title: 'Reported Content', href: '/admin/listings/reported' }
    ]
  },
  {
    title: 'Jobs',
    icon: Briefcase,
    href: '/admin/jobs'
  },
  {
    title: 'Education',
    icon: GraduationCap,
    href: '/admin/education'
  },
  {
    title: 'Promotions',
    icon: Megaphone,
    items: [
      { title: 'Active Promotions', href: '/admin/promotions' },
      { title: 'Payment Review', href: '/admin/promotions/payments' },
      { title: 'Promotion Settings', href: '/admin/promotions/settings' }
    ]
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    href: '/admin/analytics'
  },
  {
    title: 'System Settings',
    icon: Settings,
    href: '/admin/settings'
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    return 'A';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return 'Admin';
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Control Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div key={item.title}>
            {item.items ? (
              // Expandable menu item
              <div>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between font-normal",
                    item.items.some(subItem => isActive(subItem.href)) && "bg-blue-50 text-blue-700"
                  )}
                  onClick={() => toggleExpanded(item.title)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      expandedItems.includes(item.title) && "rotate-180"
                    )} 
                  />
                </Button>
                {expandedItems.includes(item.title) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.items.map((subItem) => (
                      <Button
                        key={subItem.href}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start font-normal text-sm",
                          isActive(subItem.href) && "bg-blue-100 text-blue-700"
                        )}
                        onClick={() => {
                          router.push(subItem.href);
                          setSidebarOpen(false);
                        }}
                      >
                        {subItem.title}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Regular menu item
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal",
                  isActive(item.href!, item.exact) && "bg-blue-50 text-blue-700"
                )}
                onClick={() => {
                  router.push(item.href!);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.title}
              </Button>
            )}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.photoUrl} alt={getDisplayName()} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(user?.firstName, user?.lastName, user?.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'Administrator'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-6 h-6" />
                    <span className="sr-only">Open sidebar</span>
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Page title - will be dynamic */}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 lg:hidden">
                  Admin Panel
                </h1>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
                  >
                    3
                  </Badge>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoUrl} alt={getDisplayName()} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(user?.firstName, user?.lastName, user?.username)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || 'Administrator'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>User Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/admin/settings/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}