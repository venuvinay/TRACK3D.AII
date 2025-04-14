import React from 'react';
import {
  SimpleGrid,
  Box,
  Heading,
  Text,
  Badge,
  Progress,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import { format } from 'date-fns';

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: {
    completed: number;
    planned: number;
  };
  budget: {
    estimated: number;
    spent: number;
    breakdown?: Array<{
      category: string;
      amount: number;
      spent: number;
    }>;
  };
}

interface ProjectListProps {
  projects: Project[];
  onViewAnalytics: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onEdit: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onViewAnalytics, 
  onDelete,
  onEdit 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'blue';
      case 'in-progress':
        return 'green';
      case 'completed':
        return 'purple';
      case 'on-hold':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    try {
      const end = new Date(endDate);
      const today = new Date();
      
      // Check if the date is valid
      if (isNaN(end.getTime())) {
        return 0;
      }
      
      // Set both dates to start of day for accurate calculation
      end.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return 0;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle delete with confirmation
  const handleDelete = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        onDelete(projectId);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete project',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  if (projects.length === 0) {
    return (
      <Box p={8} textAlign="center" borderWidth={1} borderRadius="lg" borderColor={borderColor}>
        <Heading size="md" mb={2}>No Projects Found</Heading>
        <Text color="gray.500">Create your first project to get started</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {projects.map((project) => {
        const daysRemaining = getDaysRemaining(project.endDate);
        const isOverdue = daysRemaining < 0;
        const budgetUtilization = project.budget.estimated > 0 
          ? (project.budget.spent / project.budget.estimated) * 100 
          : 0;
        
        return (
          <Card key={project._id} bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md" noOfLines={1}>{project.name}</Heading>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem 
                      icon={<FiBarChart2 />} 
                      onClick={() => onViewAnalytics(project)}
                    >
                      View Analytics
                    </MenuItem>
                    <MenuItem 
                      icon={<FiEdit2 />}
                      onClick={() => onEdit(project)}
                    >
                      Edit Project
                    </MenuItem>
                    <MenuItem 
                      icon={<FiTrash2 />} 
                      onClick={() => handleDelete(project._id)}
                      color="red.500"
                    >
                      Delete Project
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              <Badge colorScheme={getStatusColor(project.status)} mt={2}>
                {project.status.replace('-', ' ')}
              </Badge>
            </CardHeader>
            <CardBody>
              <Text noOfLines={2} mb={4} color="gray.600">
                {project.description}
              </Text>
              <Box mb={4}>
                <Text fontSize="sm" color="gray.500" mb={1}>Progress</Text>
                <Progress 
                  value={project.progress.completed} 
                  colorScheme="blue" 
                  size="sm" 
                  borderRadius="full" 
                />
                <Flex justify="space-between" mt={1}>
                  <Text fontSize="xs" color="gray.500">
                    Completed: {project.progress.completed}%
                  </Text>
                </Flex>
              </Box>
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">Start Date</Text>
                  <Text fontSize="sm">{formatDate(project.startDate)}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">End Date</Text>
                  <Text fontSize="sm">{formatDate(project.endDate)}</Text>
                </Box>
              </SimpleGrid>
            </CardBody>
            <CardFooter>
              <Flex justify="space-between" width="100%">
                <Box>
                  <Text fontSize="sm" color="gray.500">Budget</Text>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold">
                      {formatCurrency(project.budget.spent)} / {formatCurrency(project.budget.estimated)}
                    </Text>
                    <Progress 
                      value={budgetUtilization} 
                      size="xs" 
                      width="100%" 
                      colorScheme={budgetUtilization > 100 ? "red" : "green"}
                    />
                  </VStack>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="sm" color={isOverdue ? 'red.500' : 'gray.500'}>
                    {isOverdue ? 'Overdue' : 'Days Remaining'}
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color={isOverdue ? 'red.500' : 'inherit'}>
                    {isOverdue ? Math.abs(daysRemaining) : daysRemaining}
                  </Text>
                </Box>
              </Flex>
            </CardFooter>
          </Card>
        );
      })}
    </SimpleGrid>
  );
};

export default ProjectList; 