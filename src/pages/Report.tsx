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
import { Badge } from '@/components/ui/badge';

import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ReportsPage() {
  const navigate = useNavigate();
  const {
    token,
    fetchUsers,
    engineers,
    fetchEngineers,
    assignments,
    fetchAssignments,
    projects,
    fetchProjects,
  } = useResource();

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

      // Calculate total allocation percentage
      const totalAllocation = engineerAssignments.reduce(
        (total, assignment) => {
          return total + assignment.allocationPercentage;
        },
        0
      );

      const utilizationStatus =
        totalAllocation > engineer.maxCapacity
          ? 'overloaded'
          : totalAllocation < engineer.maxCapacity
          ? 'underutilized'
          : 'optimal';

      return {
        ...engineer,
        currentAllocation: totalAllocation,
        utilizationStatus,
        activeProjects: engineerAssignments.length,
        assignments: engineerAssignments,
      };
    });
  };

  // Calculate project status distribution
  const calculateProjectStats = () => {
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      active: statusCounts.active || 0,
      planning: statusCounts.planning || 0,
      completed: statusCounts.completed || 0,
      total: projects.length,
    };
  };

  const teamUtilization = calculateTeamUtilization();
  const projectStats = calculateProjectStats();
  const overloadedEngineers = teamUtilization.filter(
    (eng) => eng.utilizationStatus === 'overloaded'
  );
  const underutilizedEngineers = teamUtilization.filter(
    (eng) => eng.utilizationStatus === 'underutilized'
  );
  const optimalEngineers = teamUtilization.filter(
    (eng) => eng.utilizationStatus === 'optimal'
  );

  // Prepare data for Bar Chart (Team Utilization)
  const barChartData = {
    labels: teamUtilization.map((engineer) => engineer.name),
    datasets: [
      {
        label: 'Current Allocation (%)',
        data: teamUtilization.map((engineer) => engineer.currentAllocation),
        backgroundColor: teamUtilization.map((engineer) => {
          if (engineer.utilizationStatus === 'overloaded')
            return 'rgba(239, 68, 68, 0.8)';
          if (engineer.utilizationStatus === 'underutilized')
            return 'rgba(59, 130, 246, 0.8)';
          return 'rgba(34, 197, 94, 0.8)';
        }),
        borderColor: teamUtilization.map((engineer) => {
          if (engineer.utilizationStatus === 'overloaded')
            return 'rgba(239, 68, 68, 1)';
          if (engineer.utilizationStatus === 'underutilized')
            return 'rgba(59, 130, 246, 1)';
          return 'rgba(34, 197, 94, 1)';
        }),
        borderWidth: 2,
      },
      {
        label: 'Max Capacity (%)',
        data: teamUtilization.map((engineer) => engineer.maxCapacity),
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Team Utilization vs Capacity',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const engineer = teamUtilization[context.dataIndex];
            return [
              `Seniority: ${engineer.seniority}`,
              `Status: ${engineer.utilizationStatus}`,
              `Active Projects: ${engineer.activeProjects}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max:
          Math.max(
            ...teamUtilization.map((e) =>
              Math.max(e.currentAllocation, e.maxCapacity)
            )
          ) + 20,
        ticks: {
          callback: (value: any) => value + '%',
        },
        title: {
          display: true,
          text: 'Allocation Percentage (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Engineers',
        },
      },
    },
  };

  // Prepare data for Pie Chart (Project Status)
  const pieChartData = {
    labels: ['Active Projects', 'Planning Projects', 'Completed Projects'],
    datasets: [
      {
        data: [
          projectStats.active,
          projectStats.planning,
          projectStats.completed,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green for active
          'rgba(234, 179, 8, 0.8)', // Yellow for planning
          'rgba(59, 130, 246, 0.8)', // Blue for completed
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Project Status Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Reports & Analytics</h1>
              <Badge variant="outline" className="text-xs">
                Team Performance
              </Badge>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Summary Stats */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Engineers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engineers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active team members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">All projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Projects
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {projectStats.active}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overloaded Engineers
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {overloadedEngineers.length}
                </div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Team Utilization Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Utilization
                </CardTitle>
                <CardDescription>
                  Current allocation percentage vs capacity by engineer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Project Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Project Status Distribution
                </CardTitle>
                <CardDescription>
                  Overview of all project statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Utilization Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Utilization Analysis
                </CardTitle>
                <CardDescription>
                  Breakdown of team capacity utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">
                        {optimalEngineers.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Optimal
                      </div>
                      <div className="text-xs">50-100% capacity</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-red-600">
                        {overloadedEngineers.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Overloaded
                      </div>
                      <div className="text-xs">&gt;100% capacity</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {underutilizedEngineers.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Underutilized
                      </div>
                      <div className="text-xs">&lt;50% capacity</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Critical Issues</h4>
                    {overloadedEngineers.length > 0 ? (
                      <div className="space-y-2">
                        {overloadedEngineers.map((engineer) => (
                          <div
                            key={engineer._id}
                            className="flex items-center justify-between p-2 bg-red-50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {engineer.name}
                              </span>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              {engineer.currentAllocation}% /{' '}
                              {engineer.maxCapacity}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No critical utilization issues
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
                <CardDescription>
                  Current and upcoming project schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              project.status === 'active'
                                ? 'bg-green-500'
                                : project.status === 'planning'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span className="font-medium text-sm">
                            {project.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {project.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground ml-5">
                        {new Date(project.startDate).toLocaleDateString()} -{' '}
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground ml-5">
                        Team size: {project.teamSize} • Skills:{' '}
                        {project.requiredSkills.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
