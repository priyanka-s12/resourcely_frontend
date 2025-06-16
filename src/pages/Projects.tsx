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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Code,
  Loader2,
  CheckCircle,
  Clock,
  Plus,
  X,
  CalendarIcon,
  Users,
  Target,
  Briefcase,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import axios from 'axios';

// Zod schema for project form validation
const projectSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Project name is required')
      .max(100, 'Project name must be less than 100 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters'),
    startDate: z.date({
      required_error: 'Start date is required',
    }),
    endDate: z.date({
      required_error: 'End date is required',
    }),
    teamSize: z
      .number()
      .min(1, 'Team size must be at least 1')
      .max(20, 'Team size cannot exceed 20'),
    requiredSkills: z
      .array(z.string())
      .min(1, 'At least one skill is required'),
    status: z.enum(['planning', 'active', 'completed'], {
      required_error: 'Project status is required',
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type ProjectFormData = z.infer<typeof projectSchema>;

export default function Projects() {
  const navigate = useNavigate();
  const {
    token,
    users,
    fetchUsers,
    engineers,
    projects,
    fetchEngineers,
    fetchProjects,
  } = useResource();
  console.log(token);
  console.log('User: ', users);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    fetchUsers();
    fetchEngineers();
    fetchProjects();
  }, []);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      teamSize: 1,
      requiredSkills: [],
      status: 'planning',
    },
  });

  // Get all unique skills from engineers and projects
  const getAllSkills = () => {
    const skillsSet = new Set<string>();

    // Add skills from engineers
    engineers.forEach((engineer) => {
      engineer.skills.forEach((skill) => skillsSet.add(skill));
    });

    // Add skills from existing projects
    projects.forEach((project) => {
      project.requiredSkills.forEach((skill) => skillsSet.add(skill));
    });

    return Array.from(skillsSet).sort();
  };

  const allSkills = getAllSkills();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'planning':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'planning':
        return Clock;
      case 'completed':
        return Target;
      default:
        return Clock;
    }
  };

  const headers = {
    headers: {
      Authorization: token,
    },
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Prepare the project data for the API
      const projectData = {
        name: data.name,
        description: data.description,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        requiredSkills: data.requiredSkills,
        teamSize: data.teamSize,
        status: data.status,
        managerId: users?._id,
      };

      console.log('Sending project data to API:', projectData);

      // Make API call to create the project
      const response = await axios.post(
        'https://resourcely-backend.vercel.app/api/projects',
        projectData,
        headers
      );

      console.log('Res: ', response);
      console.log('API Response status:', response.status);

      // Reset form and close modal
      form.reset();
      setIsCreateModalOpen(false);

      // Refresh the projects list
      await fetchProjects();

      // Show success message
      alert('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      alert(`Error creating project: ${errorMessage}`);
    }
  };

  const handleSkillSelect = (skill: string, currentSkills: string[]) => {
    if (currentSkills.includes(skill)) {
      return currentSkills.filter((s) => s !== skill);
    } else {
      return [...currentSkills, skill];
    }
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
              <h1 className="text-lg font-semibold">Projects</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Create Project Modal */}
              <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Add a new project to your portfolio. Fill in all the
                      required information below.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Project Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter project name"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A clear, descriptive name for your project
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the project goals, scope, and key deliverables"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Provide a detailed description of the project
                              (10-500 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Date Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={'outline'}
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date <
                                      new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                When the project will begin
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={'outline'}
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date <
                                      new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Expected project completion date
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Team Size and Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="teamSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team Size</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="20"
                                  placeholder="Number of team members"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      Number.parseInt(e.target.value) || 1
                                    )
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Required number of engineers (1-20)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="planning">
                                    Planning
                                  </SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Current project phase
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Required Skills */}
                      <FormField
                        control={form.control}
                        name="requiredSkills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Required Skills</FormLabel>
                            <FormDescription>
                              Select the technologies and skills needed for this
                              project
                            </FormDescription>
                            <FormControl>
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {allSkills.map((skill) => (
                                    <Badge
                                      key={skill}
                                      variant={
                                        field.value?.includes(skill)
                                          ? 'default'
                                          : 'outline'
                                      }
                                      className="cursor-pointer hover:bg-primary/80"
                                      onClick={() => {
                                        const newSkills = handleSkillSelect(
                                          skill,
                                          field.value
                                        );
                                        field.onChange(newSkills);
                                      }}
                                    >
                                      {skill}
                                      {field.value?.includes(skill) && (
                                        <X className="ml-1 h-3 w-3" />
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                                {field.value?.length > 0 && (
                                  <div className="text-sm text-muted-foreground">
                                    Selected: {field.value.join(', ')}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Form Actions */}
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Project'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Summary Stats */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
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
                  {projects.filter((p) => p.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Planning Phase
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {projects.filter((p) => p.status === 'planning').length}
                </div>
                <p className="text-xs text-muted-foreground">In planning</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {projects.filter((p) => p.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully delivered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Projects Directory
              </CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              {projects && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">
                          Project Name
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead>Team Size</TableHead>
                        <TableHead>Required Skills</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => {
                        const StatusIcon = getStatusIcon(project.status);
                        const startDate = new Date(project.startDate);
                        const endDate = new Date(project.endDate);

                        return (
                          <TableRow key={project._id}>
                            <TableCell className="font-medium">
                              <div className="space-y-1">
                                <div className="font-semibold">
                                  {project.name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[300px]">
                                <p className="text-sm line-clamp-2 whitespace-normal break-words max-w-xs">
                                  {project.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {startDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
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
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {project.teamSize}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  engineers
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {project.requiredSkills
                                  .slice(0, 3)
                                  .map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                {project.requiredSkills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{project.requiredSkills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusColor(project.status)}
                                className="text-xs flex items-center gap-1 w-fit capitalize"
                              >
                                <StatusIcon className="h-3 w-3" />
                                {project.status}
                              </Badge>
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
