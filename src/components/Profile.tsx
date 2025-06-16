import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useResource from '../contexts/ResourceContext';
import { UserSidebar } from './UserSidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Building, Award, Code, TrendingUp } from 'lucide-react';

export default function Profile() {
  const { users, fetchUsers } = useResource();
  const navigate = useNavigate();

  // console.log('Profile users:', users);

  const getRoleDisplayName = (role: string) => {
    if (!role) return 'Undefined';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');

    if (!storedToken) {
      navigate('/login');
      return;
    }

    // Fetch users if not already loaded
    if (!users) {
      fetchUsers();
    }
  }, []);

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Profile</h1>
            <Badge variant="outline" className="text-xs">
              Personal Information
            </Badge>
          </div>
        </header>

        {users && (
          <>
            {' '}
            <div className="flex flex-1 flex-col gap-6 p-6">
              {/* Profile Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="rounded-lg bg-red-500">
                      <AvatarImage
                        src="/placeholder.svg?height=64&width=64"
                        alt="@evilrabbit"
                      />
                      <AvatarFallback>
                        {users.role === 'engineer' ? 'ER' : 'MR'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{users.name}</CardTitle>
                      </div>
                      <CardDescription className="text-base">
                        {users.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Your basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Name</p>
                          <p className="text-base">{users.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-base">{users.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Role</p>
                          <p className="text-base">
                            {getRoleDisplayName(users.role)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Department</p>
                          <p className="text-base">{users.department}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engineer-specific Information */}
              {users.role === 'engineer' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Engineering Details
                    </CardTitle>
                    <CardDescription>
                      Your technical profile and capacity information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {users.seniority && (
                          <div className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Seniority</p>
                              <p className="text-base">{users.seniority}</p>
                            </div>
                          </div>
                        )}

                        {users.maxCapacity && (
                          <div className="flex items-start gap-3">
                            <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                Max Capacity
                              </p>
                              <p className="text-base">{users.maxCapacity}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {users.skills && users.skills.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Code className="h-4 w-4 text-muted-foreground" />
                              Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {users.skills.map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-sm"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
