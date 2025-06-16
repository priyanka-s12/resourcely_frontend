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
import {
  Users,
  BarChart3,
  TrendingUp,
  Calendar,
  StickyNote,
} from 'lucide-react';
import useResource from '../contexts/ResourceContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const {
    token,
    users,
    fetchUsers,
    engineers,
    fetchEngineers,
    assignments,
    fetchAssignments,
    projects,
    fetchProjects,
  } = useResource();
  //   console.log('Users: ', users);
  //   console.log('Engineers: ', engineers);
  //   console.log('Assignments: ', assignments);
  //   console.log('Projects: ', projects);
  //   console.log('Token: ', token);

  // Calculate team utilization
  const calculateTeamUtilization = () => {
    return engineers.map((engineer) => {
      // Get current assignments for this engineer
      const engineerAssignments = assignments.filter((assignment) => {
        const now = Date.now();
        const startDate = new Date(assignment.startDate).getTime();
        const endDate = new Date(assignment.endDate).getTime();

        return (
          assignment.engineerId.email === engineer.email &&
          startDate <= now &&
          endDate > now
        );
      });
      //   console.log('eng assign', engineerAssignments);

      // Calculate total allocation percentage
      const totalAllocation = engineerAssignments.reduce(
        (total, assignment) => {
          return total + assignment.allocationPercentage;
        },
        0
      );
      //   console.log('Total Allo', totalAllocation);

      const utilizationStatus =
        totalAllocation > 100
          ? 'overloaded'
          : totalAllocation < 50
          ? 'underutilized'
          : 'optimal';
      //   console.log('status', utilizationStatus);
      return {
        ...engineer,
        currentAllocation: totalAllocation,
        utilizationStatus,
        activeProjects: engineerAssignments.length,
        assignments: engineerAssignments,
      };
    });
  };

  const teamUtilization = calculateTeamUtilization();
  //   console.log('tam uti', teamUtilization);
  //   const overloadedEngineers = teamUtilization.filter(
  //     (eng) => eng.utilizationStatus === 'overloaded'
  //   );
  //   console.log('over', overloadedEngineers);
  //   const underutilizedEngineers = teamUtilization.filter(
  //     (eng) => eng.utilizationStatus === 'underutilized'
  //   );
  //   console.log('under', underutilizedEngineers);
  //   const optimalEngineers = teamUtilization.filter(
  //     (eng) => eng.utilizationStatus === 'optimal'
  //   );
  //   console.log('optimal', optimalEngineers);

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

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Manager Dashboard</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Engineers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engineers?.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active Team Members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects?.length}</div>
                <p className="text-xs text-muted-foreground">In System</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assignments
                </CardTitle>
                <StickyNote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total Assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Running
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamUtilization.length}
                </div>
                <p className="text-xs text-muted-foreground">Assignments</p>
              </CardContent>
            </Card>
          </div>

          {users && (
            <>
              {/* Team Utilization Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Team Utilization Overview
                  </CardTitle>
                  <CardDescription>
                    Current allocation and capacity utilization for all
                    engineers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Engineer</TableHead>
                          <TableHead>Seniority</TableHead>
                          <TableHead>
                            Current Allocation of Max Capacity
                          </TableHead>
                          {/* <TableHead>Status</TableHead> */}
                          <TableHead>Active Projects</TableHead>
                          <TableHead className="text-right">Capacity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamUtilization.map((engineer) => {
                          return (
                            <TableRow key={engineer._id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-semibold">
                                      {engineer.name}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{engineer.seniority}</TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>{engineer.currentAllocation}%</span>
                                    <span className="text-muted-foreground">
                                      of {engineer.maxCapacity}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={Math.min(
                                      engineer.currentAllocation,
                                      100
                                    )}
                                    className="h-2"
                                  />
                                  {engineer.currentAllocation}
                                </div>
                              </TableCell>
                              {/* <TableCell>
                                {engineer.utilizationStatus}
                              </TableCell> */}
                              <TableCell className="text-center">
                                {engineer.activeProjects}{' '}
                                {engineer.activeProjects === 1
                                  ? 'Project'
                                  : 'Projects'}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {engineer.maxCapacity}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
