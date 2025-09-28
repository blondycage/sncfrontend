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
  Activity,
  Hotel
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
    title: 'Dormitories',
    icon: Hotel,
    href: '/admin/dormitories'
  },
  {
    title: 'Blog',
    icon: FileText,
    href: '/admin/blog'
  },
  {
    title: 'Promotions',
    icon: Megaphone,
    items: [
      { title: 'Active Promotions', href: '/admin/promotions' },
      { title: 'Payment Review', href: '/admin/promotions/payments' },
      { title: 'Promotion Settings', href: '/admin/settings/promotions' }
    ]
  },
  
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

  const getInitials = (firstName?: string | null, lastName?: string | null, username?: string | null) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (username) return username[0].toUpperCase();
    return 'A';
  };

  const getDisplayName = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const username = user?.username || '';
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (username) return username;
    return 'Admin';
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-blue-600 rounded-lg shadow-lg">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Admin Panel</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Control Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div key={item.title}>
            {item.items ? (
              // Expandable menu item
              <div>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between font-normal text-sm py-2 h-auto",
                    item.items.some(subItem => isActive(subItem.href)) && "bg-gradient-to-r from-red-50 to-blue-50 text-red-700 border-r-2 border-red-500"
                  )}
                  onClick={() => toggleExpanded(item.title)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate text-left">{item.title}</span>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 flex-shrink-0",
                      expandedItems.includes(item.title) && "rotate-180"
                    )} 
                  />
                </Button>
                {expandedItems.includes(item.title) && (
                  <div className="ml-6 sm:ml-8 mt-1 sm:mt-2 space-y-1">
                    {item.items.map((subItem) => (
                      <Button
                        key={subItem.href}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start font-normal text-xs sm:text-sm py-1.5 h-auto",
                          isActive(subItem.href) && "bg-gradient-to-r from-red-100 to-blue-100 text-red-700"
                        )}
                        onClick={() => {
                          router.push(subItem.href);
                          setSidebarOpen(false);
                        }}
                      >
                        <span className="truncate text-left">{subItem.title}</span>
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
                  "w-full justify-start font-normal text-sm py-2 h-auto",
                  isActive(item.href!, item.exact) && "bg-gradient-to-r from-red-50 to-blue-50 text-red-700 border-r-2 border-red-500"
                )}
                onClick={() => {
                  router.push(item.href!);
                  setSidebarOpen(false);
                }}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate text-left">{item.title}</span>
                </div>
              </Button>
            )}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
            <AvatarImage src={user?.photoUrl} alt={getDisplayName()} />
            <AvatarFallback className="bg-gradient-to-br from-red-100 to-blue-100 text-red-600 text-xs sm:text-sm">
              {getInitials(user?.firstName, user?.lastName, user?.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
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
        <header className="bg-gradient-to-r from-white via-blue-50 to-red-50 shadow-lg border-b-2 border-gradient-to-r from-blue-200 to-red-200 sticky top-0 z-40">
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Mobile menu button */}
              <div className="flex items-center lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Menu className="w-5 h-5" />
                      <span className="sr-only">Open sidebar</span>
                    </Button>
                  </SheetTrigger>
                </Sheet>
                
                {/* Mobile page title */}
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Admin Panel
                </h1>
              </div>

              {/* Desktop page title - hidden on mobile */}
              <div className="hidden lg:block">
                <h1 className="text-xl xl:text-2xl font-semibold text-gray-900">
                  {/* Dynamic title will be set by individual pages */}
                </h1>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                {/* Notifications - hidden on very small screens */}
            

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                        <AvatarImage src={user?.photoUrl} alt={getDisplayName()} />
                        <AvatarFallback className="bg-gradient-to-br from-red-100 to-blue-100 text-red-600 text-xs sm:text-sm">
                          {getInitials(user?.firstName, user?.lastName, user?.username)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 sm:w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs sm:text-sm font-medium leading-none truncate">{getDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user?.email || 'Administrator'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span className="text-sm">User Dashboard</span>
                    </DropdownMenuItem>
                   
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="text-sm">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-red-50/30 overflow-x-hidden">
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 max-w-full">
            <div className="max-w-7xl mx-auto overflow-x-hidden">
              <div className="min-w-0">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
