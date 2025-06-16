import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import useAxios from '../custom/useAxios';

// Define types for the data being fetched
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'engineer';
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  maxCapacity: number;
  department: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  status: 'planning' | 'active' | 'completed';
  managerId: string;
}

interface Assignment {
  _id: string;
  engineerId: {
    _id: string;
    name: string;
    email: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
  role: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}

// Define context type
interface ResourceContextType {
  token: string | null;
  users: User;
  usersLoading: boolean;
  usersError: string | null;
  fetchUsers: () => Promise<void>;

  engineers: User[];
  engineerLoading: boolean;
  engineerError: string | null;
  fetchEngineers: () => Promise<void>;

  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  fetchProjects: () => Promise<void>;

  assignments: Assignment[];
  assignmentsLoading: boolean;
  assignmentsError: string | null;
  fetchAssignments: () => Promise<void>;
}

// Create context with default undefined
const ResourceContext = createContext<ResourceContextType | undefined>(
  undefined
);

// Custom hook for accessing context
const useResource = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within a ResourceProvider');
  }
  return context;
};

export default useResource;

// Props type for the provider
interface ResourceProviderProps {
  children: ReactNode;
}

export const ResourceProvider = ({ children }: ResourceProviderProps) => {
  const token = JSON.parse(localStorage.getItem('userToken') || 'null');

  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    fetchData: fetchUsers,
  } = useAxios<User>('https://resourcely-backend.vercel.app/api/auth/profile');

  const {
    data: engineers,
    loading: engineerLoading,
    error: engineerError,
    fetchData: fetchEngineers,
  } = useAxios<User[]>('https://resourcely-backend.vercel.app/api/engineers');

  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
    fetchData: fetchProjects,
  } = useAxios<Project[]>('https://resourcely-backend.vercel.app/api/projects');

  const {
    data: assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    fetchData: fetchAssignments,
  } = useAxios<Assignment[]>(
    'https://resourcely-backend.vercel.app/api/assignments'
  );

  return (
    <ResourceContext.Provider
      value={{
        token,
        users,
        usersLoading,
        usersError,
        fetchUsers,
        engineers,
        engineerLoading,
        engineerError,
        fetchEngineers,
        projects,
        projectsLoading,
        projectsError,
        fetchProjects,
        assignments,
        assignmentsLoading,
        assignmentsError,
        fetchAssignments,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};
