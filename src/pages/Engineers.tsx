import { useEffect, useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Filter,
  Search,
  X,
  CalendarDays,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FilterState {
  search: string;
  skills: string[];
}

export default function Engineers() {
  const navigate = useNavigate();
  const {
    token,
    fetchUsers,
    engineers,
    fetchEngineers,
    assignments,
    fetchAssignments,
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

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    skills: [],
  });

  const [showFilters, setShowFilters] = useState(false);

  // Get active assignments for an engineer
  const getActiveAssignments = (engineerId: string) => {
    const now = Date.now();
    return assignments.filter((assignment) => {
      const startDate = new Date(assignment.startDate).getTime();
      const endDate = new Date(assignment.endDate).getTime();
      return (
        assignment.engineerId._id === engineerId &&
        startDate <= now &&
        endDate > now
      );
    });
  };

  // Calculate available capacity for an engineer
  const getAvailableCapacity = (engineerId: string) => {
    const engineer = engineers.find((e) => e._id === engineerId);
    if (!engineer) return 0;

    const activeAssignments = getActiveAssignments(engineerId);
    const totalAllocated = activeAssignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );
    return engineer.maxCapacity - totalAllocated;
  };

  // Calculate when engineers will be available for new projects
  const calculateAvailabilityTimeline = () => {
    return engineers.map((engineer) => {
      // Get all assignments (current and future)
      const allAssignments = assignments
        .filter((assignment) => assignment.engineerId._id === engineer._id)
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

      const now = new Date();
      // Check current availability
      const currentAssignments = allAssignments.filter((assignment) => {
        const startDate = new Date(assignment.startDate);
        const endDate = new Date(assignment.endDate);
        return startDate <= now && endDate > now;
      });

      const currentAllocation = currentAssignments.reduce(
        (sum, a) => sum + a.allocationPercentage,
        0
      );
      const currentAvailability = engineer.maxCapacity - currentAllocation;

      // Find next full availability date
      let nextFullAvailability = now;
      if (currentAvailability <= 0) {
        // Find when current projects end
        const currentProjectEndDates = currentAssignments.map(
          (a) => new Date(a.endDate)
        );
        if (currentProjectEndDates.length > 0) {
          nextFullAvailability = new Date(
            Math.min(...currentProjectEndDates.map((d) => d.getTime()))
          );
        }
      }

      return {
        ...engineer,
        currentAvailability,
        nextFullAvailability,
        allAssignments,
      };
    });
  };

  // Calculate engineer utilization and availability
  const calculateEngineerData = () => {
    return engineers.map((engineer) => {
      const activeAssignments = getActiveAssignments(engineer._id);
      const totalAllocation = activeAssignments.reduce((total, assignment) => {
        return total + assignment.allocationPercentage;
      }, 0);

      const availableCapacity = getAvailableCapacity(engineer._id);
      const utilizationPercentage = Math.min(
        100,
        (totalAllocation / engineer.maxCapacity) * 100
      );

      const utilizationStatus =
        totalAllocation > engineer.maxCapacity
          ? 'overloaded'
          : totalAllocation < engineer.maxCapacity
          ? 'underutilized'
          : 'optimal';

      const workType = engineer.maxCapacity === 100 ? 'Full-time' : 'Part-time';

      return {
        ...engineer,
        currentAllocation: totalAllocation,
        availableCapacity,
        utilizationPercentage,
        utilizationStatus,
        workType,
        activeProjects: activeAssignments.length,
        assignments: activeAssignments,
      };
    });
  };

  // Get all unique skills from engineers
  const getAllSkills = () => {
    const skillsSet = new Set<string>();
    engineers.forEach((engineer) => {
      engineer.skills.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  };

  // Filter engineers based on current filters
  const filterEngineers = (engineersData: any[]) => {
    return engineersData.filter((engineer) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();

        const matchesSkills = engineer.skills.some((skill: string) =>
          skill.toLowerCase().includes(searchLower)
        );
        if (!matchesSkills) return false;
      }

      // Skills filter
      if (filters.skills.length > 0) {
        const hasRequiredSkills = filters.skills.some((skill) =>
          engineer.skills.includes(skill)
        );
        if (!hasRequiredSkills) return false;
      }

      return true;
    });
  };

  const engineersData = calculateEngineerData();
  const availabilityData = calculateAvailabilityTimeline();
  const filteredAvailability = filterEngineers(availabilityData);
  const filteredEngineers = filterEngineers(engineersData);
  const allSkills = getAllSkills();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUtilizationColor = (status: string) => {
    switch (status) {
      case 'overloaded':
        return 'destructive';
      case 'underutilized':
        return 'secondary';
      case 'optimal':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getUtilizationIcon = (status: string) => {
    switch (status) {
      case 'overloaded':
        return AlertTriangle;
      case 'underutilized':
        return Clock;
      case 'optimal':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'senior':
        return 'default';
      case 'mid':
        return 'secondary';
      case 'junior':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      skills: [],
    });
  };

  const hasActiveFilters = filters.search || filters.skills.length > 0;

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Engineers</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {
                      [filters.search, filters.skills.length].filter(Boolean)
                        .length
                    }
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Search and Filters */}
          <Card className={showFilters ? 'block' : 'hidden'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter Engineers
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
              <CardDescription>Find engineers by name, skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or skills..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Skills Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={
                        filters.skills.includes(skill) ? 'default' : 'outline'
                      }
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                      {filters.skills.includes(skill) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Showing Engineers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredEngineers.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {engineersData.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overloaded
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {
                    filteredEngineers.filter(
                      (e) => e.utilizationStatus === 'overloaded'
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Underutilized
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {
                    filteredEngineers.filter(
                      (e) => e.utilizationStatus === 'underutilized'
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Available for more work
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Availability Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Availability Planning
              </CardTitle>
              <CardDescription>
                When engineers will be available for new projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quick Availability Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        filteredAvailability.filter(
                          (e) => e.currentAvailability > 0
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Now
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        filteredAvailability.filter(
                          (e) =>
                            e.currentAvailability === 0 &&
                            e.nextFullAvailability > new Date()
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Soon
                    </div>
                  </div>
                </div>

                {/* Project Planning Helper */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">
                    Project Planning Helper
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">
                        Available for Immediate Start
                      </h5>
                      <div className="space-y-2">
                        {filteredAvailability
                          .filter((e) => e.currentAvailability > 0)
                          .sort(
                            (a, b) =>
                              b.currentAvailability - a.currentAvailability
                          )
                          .slice(0, 3)
                          .map((engineer) => (
                            <div
                              key={engineer._id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{engineer.name}</span>
                              <Badge variant="outline">
                                {engineer.currentAvailability}% available
                              </Badge>
                            </div>
                          ))}
                        {filteredAvailability.filter(
                          (e) => e.currentAvailability > 0
                        ).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No engineers immediately available
                          </p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h5 className="font-medium mb-2">
                        Becoming Available Soon
                      </h5>
                      <div className="space-y-2">
                        {filteredAvailability
                          .filter(
                            (e) =>
                              e.currentAvailability <= 0 &&
                              e.nextFullAvailability > new Date()
                          )
                          .sort(
                            (a, b) =>
                              a.nextFullAvailability.getTime() -
                              b.nextFullAvailability.getTime()
                          )
                          .slice(0, 3)
                          .map((engineer) => (
                            <div
                              key={engineer._id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{engineer.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {engineer.nextFullAvailability.toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </Badge>
                            </div>
                          ))}
                        {filteredAvailability.filter(
                          (e) =>
                            e.currentAvailability <= 0 &&
                            e.nextFullAvailability > new Date()
                        ).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            All engineers have ongoing commitments
                          </p>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engineers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Engineers Directory
              </CardTitle>
              <CardDescription>
                {filteredEngineers.length === 0
                  ? 'No engineers match your current filters'
                  : `Showing ${filteredEngineers.length} engineer${
                      filteredEngineers.length !== 1 ? 's' : ''
                    }`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEngineers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    No engineers found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Engineer</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Seniority</TableHead>
                        <TableHead>Work Type</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">
                          Available Capacity
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEngineers.map((engineer) => {
                        const UtilizationIcon = getUtilizationIcon(
                          engineer.utilizationStatus
                        );
                        return (
                          <TableRow key={engineer._id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={engineer.avatar || '/placeholder.svg'}
                                    alt={engineer.name}
                                  />
                                  <AvatarFallback className="text-sm">
                                    {getUserInitials(engineer.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">
                                    {engineer.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {engineer.email}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {engineer.department}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {engineer.skills
                                  .slice(0, 3)
                                  .map((skill: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                {engineer.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{engineer.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getSeniorityColor(engineer.seniority)}
                                className="text-xs capitalize"
                              >
                                {engineer.seniority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    engineer.workType === 'Full-time'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {engineer.workType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  ({engineer.maxCapacity}%)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>
                                    {engineer.currentAllocation}% allocated
                                  </span>
                                  <span className="text-muted-foreground">
                                    of {engineer.maxCapacity}%
                                  </span>
                                </div>
                                <Progress
                                  value={Math.min(
                                    engineer.utilizationPercentage,
                                    100
                                  )}
                                  className="h-2"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getUtilizationColor(
                                  engineer.utilizationStatus
                                )}
                                className="text-xs flex items-center gap-1 w-fit"
                              >
                                <UtilizationIcon className="h-3 w-3" />
                                {engineer.utilizationStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {engineer.availableCapacity > 0 ? (
                                    <span className="text-green-600">
                                      {engineer.availableCapacity}% available
                                    </span>
                                  ) : engineer.availableCapacity === 0 ? (
                                    <span className="text-yellow-600">
                                      Fully allocated
                                    </span>
                                  ) : (
                                    <span className="text-red-600">
                                      {Math.abs(engineer.availableCapacity)}%
                                      over capacity
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {engineer.activeProjects} active project
                                  {engineer.activeProjects !== 1 ? 's' : ''}
                                </div>
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
