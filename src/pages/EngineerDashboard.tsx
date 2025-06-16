import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSidebar } from '@/components/UserSidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Code, GitBranch, CheckCircle, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useResource from '../contexts/ResourceContext';

export default function EngineerDashboard() {
  const navigate = useNavigate();
  const { token, users, fetchUsers, assignments, fetchAssignments } =
    useResource();
  console.log('Users: ', users);
  console.log('Assignments: ', assignments);
  console.log('Token: ', token);

  // Filter assignments for current engineer
  const findEngineer = assignments.filter(
    (assignment) => assignment.engineerId.email === users?.email
  );
  console.log('Find Engineer Assignments: ', findEngineer);

  const currentEngrAssignments = findEngineer.filter((assignment) => {
    const nowDate = Date.now();
    const startDate = new Date(assignment.startDate).getTime();
    const endDate = new Date(assignment.endDate).getTime();

    const isCurrent = startDate <= nowDate && endDate > nowDate;
    return isCurrent;
  });
  console.log('Current Assignments:', currentEngrAssignments);

  const upcomingAssignments = findEngineer.filter(
    (assignment) => new Date(assignment.startDate).getTime() > Date.now()
  );
  console.log('Upcoming Assignments:', upcomingAssignments);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    fetchUsers();
    fetchAssignments();
  }, []);

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Engineer Dashboard</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Projects
                </CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{findEngineer.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Projects
                </CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentEngrAssignments.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Projects
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {upcomingAssignments.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Current Projects
              </CardTitle>
              <CardDescription>
                Projects you're actively working on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentEngrAssignments.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">
                          Project Name
                        </TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Allocation</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentEngrAssignments.map((assignment) => (
                        <TableRow key={assignment._id}>
                          <TableCell className="font-medium">
                            <div className="space-y-1">
                              <div className="font-semibold">
                                {assignment.projectId.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{assignment.role}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{assignment.allocationPercentage} %</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(assignment?.startDate).toLocaleString(
                              'en-US',
                              {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(assignment?.endDate).toLocaleString(
                              'en-US',
                              {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    No current projects assigned
                  </p>
                  <p className="text-sm">
                    Check back later for new assignments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Projects
              </CardTitle>
              <CardDescription>Projects starting soon</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">
                          Project Name
                        </TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Allocation</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingAssignments.map((assignment) => (
                        <TableRow key={assignment._id}>
                          <TableCell className="font-medium">
                            <div className="space-y-1">
                              <div className="font-semibold">
                                {assignment.projectId.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{assignment.role}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {assignment.allocationPercentage} %
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(assignment?.startDate).toLocaleString(
                              'en-US',
                              {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(assignment?.endDate).toLocaleString(
                              'en-US',
                              {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    No upcoming projects scheduled
                  </p>
                  <p className="text-sm">Your schedule is clear for now</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
