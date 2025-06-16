import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Home,
  Code,
  StickyNote,
  FolderOpenDot,
  User,
  ChartPie,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useEffect } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import useResource from '../contexts/ResourceContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function UserSidebar() {
  const navigate = useNavigate();

  const { users, fetchUsers } = useResource();
  // console.log('Users from sidebar: ', users);
  // console.log('Token from sidebar: ', token);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/');
  };

  const getRoleDisplayName = (role?: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'manager' ? 'default' : 'secondary';
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="[&>[data-sidebar=sidebar]]:overflow-hidden"
    >
      {/* Header with App Title */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-lg">Resourcely</span>
          </div>
        </div>
      </SidebarHeader>

      {/* User Information Section */}
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>User Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col items-center space-y-3 p-4 bg-sidebar-accent/50 rounded-lg mx-2">
              <Avatar className="rounded-lg bg-red-500">
                <AvatarImage
                  src="/placeholder.svg?height=64&width=64"
                  alt="@evilrabbit"
                />
                <AvatarFallback>
                  {users.role === 'engineer' ? 'ER' : 'MR'}
                </AvatarFallback>
              </Avatar>

              <div className="text-center space-y-1">
                <h3 className="font-semibold text-sm">{users?.name}</h3>
                <Badge
                  variant={getRoleBadgeVariant(users?.role)}
                  className="text-xs"
                >
                  {getRoleDisplayName(users.role)}
                </Badge>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {users.email}
                </p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-4" />

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {users.role === 'engineer' ? (
                  <>
                    <SidebarMenuButton>
                      <Home />
                      <Link to="/engineer-dashboard">Dashboard</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton>
                      <User />
                      <Link to="/profile">Profile</Link>
                    </SidebarMenuButton>
                  </>
                ) : (
                  <>
                    <SidebarMenuButton>
                      <Home />
                      <Link to="/manager-dashboard">Dashboard</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton>
                      <User />
                      <Link to="/engineers">Engineeres</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton>
                      <FolderOpenDot />
                      <Link to="/projects">Projects</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton>
                      <StickyNote />
                      <Link to="/assignments">Assignments</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton>
                      <ChartPie />
                      <Link to="/report">Report</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton>
                      <User />
                      <Link to="/profile">Profile</Link>
                    </SidebarMenuButton>
                  </>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Logout */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-12 px-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
