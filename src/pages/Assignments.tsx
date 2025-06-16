import { useEffect } from 'react';
import useResource from '../contexts/ResourceContext';
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

import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, ClipboardList, Clock, Target } from 'lucide-react';

export default function Assignments() {
  const navigate = useNavigate();
  const {
    token,
    fetchUsers,
    fetchEngineers,
    fetchProjects,
    assignments,
    fetchAssignments,
  } = useResource();
  console.log(token);
  console.log('Assignments: ', assignments);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    fetchUsers();
    fetchEngineers();
    fetchProjects();
    fetchAssignments();
  }, []);

  // Calculate assignment status based on dates
  const getAssignmentStatus = (startDate: string, endDate: string) => {
    const now = Date.now();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  // Calculate assignment progress
  const getAssignmentProgress = (startDate: string, endDate: string) => {
    const now = Date.now();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    const progress = ((now - start) / (end - start)) * 100;
    return Math.round(progress);
  };

  // Calculate summary statistics
  const activeAssignments = assignments.filter(
    (a) => getAssignmentStatus(a.startDate, a.endDate) === 'active'
  ).length;
  const upcomingAssignments = assignments.filter(
    (a) => getAssignmentStatus(a.startDate, a.endDate) === 'upcoming'
  ).length;
  const completedAssignments = assignments.filter(
    (a) => getAssignmentStatus(a.startDate, a.endDate) === 'completed'
  ).length;

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Assignments</h1>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Summary Stats */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assignments
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <p className="text-xs text-muted-foreground">All assignments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Assignments
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activeAssignments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {upcomingAssignments}
                </div>
                <p className="text-xs text-muted-foreground">Starting soon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {completedAssignments}
                </div>
                <p className="text-xs text-muted-foreground">Finished</p>
              </CardContent>
            </Card>
          </div>

          {/* Assignments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                All Assignments
              </CardTitle>
              <CardDescription>
                {assignments.length === 0
                  ? 'No assignments match your current filters'
                  : `Showing ${assignments.length} assignment${
                      assignments.length !== 1 ? 's' : ''
                    }`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    No assignments found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Engineer</TableHead>
                        <TableHead className="w-[200px]">Project</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Allocation</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => {
                        const progress = getAssignmentProgress(
                          assignment.startDate,
                          assignment.endDate
                        );
                        // const StatusIcon = getStatusIcon(status);
                        const startDate = new Date(assignment.startDate);
                        const endDate = new Date(assignment.endDate);

                        return (
                          <TableRow key={assignment._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-sm">
                                    {assignment.engineerId.name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {assignment.projectId.name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{assignment.role}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {assignment.allocationPercentage}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {startDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                  {' - '}
                                  {endDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
