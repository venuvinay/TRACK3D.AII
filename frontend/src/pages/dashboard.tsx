import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Button,
  Flex,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Center,
  Divider,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiPlus, 
  FiMoreVertical, 
  FiEdit2, 
  FiTrash2, 
  FiBarChart2, 
  FiLogOut, 
  FiUser, 
  FiSearch, 
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ProjectForm from '../components/ProjectForm';
import ProjectAnalytics from '../components/ProjectAnalytics';
import ProjectList from '../components/ProjectList';
import { AxiosError } from 'axios';

interface ErrorResponse { message: string; }

// API base URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statCardBg = useColorModeValue('white', 'gray.700');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !token) {
      router.push('/login');
    }
  }, [user, token, router]);

  // Fetch projects
  const { data: projects, isLoading, error } = useQuery(
    'projects',
    async () => {
      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched projects:', response.data); // Debug log
      return response.data;
    },
    {
      enabled: !!token,
      refetchOnWindowFocus: false,
    }
  );

  // Create project mutation
  const createProject = useMutation(
    async (newProject) => {
      const response = await axios.post(`${API_URL}/api/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        toast({
          title: 'Project created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast({
          title: 'Error creating project',
          description: error.response?.data?.message || 'Something went wrong',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  // Delete project mutation
  const deleteProject = useMutation(
    async (projectId) => {
      await axios.delete(`${API_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        toast({
          title: 'Project deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast({
          title: 'Error deleting project',
          description: error.response?.data?.message || 'Something went wrong',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  // Handle project creation
  const handleCreateProject = (projectData) => {
    createProject.mutate(projectData);
  };

  // Handle project deletion
  const handleDeleteProject = (projectId) => {
    deleteProject.mutate(projectId);
  };

  // Handle project selection for analytics
  const handleViewAnalytics = (project) => {
    setSelectedProject(project);
    setActiveTab(1);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Filter and sort projects
  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'priority':
        return (b.priority || 0) - (a.priority || 0);
      case 'deadline':
        return new Date(a.expectedEndDate) - new Date(b.expectedEndDate);
      default:
        return 0;
    }
  });

  // Calculate dashboard stats
  const getProjectStats = () => {
    if (!projects || projects.length === 0) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        delayed: 0,
        upcomingDeadlines: 0,
        highPriority: 0
      };
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'in-progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      delayed: projects.filter(p => p.status === 'delayed').length,
      upcomingDeadlines: projects.filter(p => {
        const endDate = new Date(p.expectedEndDate);
        return endDate >= today && endDate <= nextWeek;
      }).length,
      highPriority: projects.filter(p => p.priority === 'high').length
    };
  };

  const stats = getProjectStats();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10}>
        <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
          <Heading color="red.500">Error Loading Dashboard</Heading>
          <Text mt={4}>There was a problem loading your projects. Please try again later.</Text>
          <Button mt={4} colorScheme="blue" onClick={() => queryClient.invalidateQueries('projects')}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Tabs 
        variant="soft-rounded" 
        colorScheme="blue" 
        index={activeTab} 
        onChange={setActiveTab}
      >
        {/* Header */}
        <Box 
          bg={bgColor} 
          px={8} 
          py={4} 
          borderBottom="1px" 
          borderColor={borderColor}
          position="sticky"
          top={0}
          zIndex={10}
          boxShadow="sm"
        >
          <Container maxW="container.xl">
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={8}>
                <Heading size="lg" color={useColorModeValue('gray.700', 'white')}>
                  Project Management Dashboard
                </Heading>
                <TabList>
                  <Tab>Projects</Tab>
                  <Tab>Analytics</Tab>
                </TabList>
              </Flex>
              <Flex gap={4} align="center">
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={onOpen}
                  size="md"
                  fontWeight="medium"
                >
                  Create Project
                </Button>
                <Menu>
                  <MenuButton>
                    <Avatar 
                      size="sm" 
                      name={user?.name || 'User'} 
                      src={user?.avatar}
                      cursor="pointer"
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<FiUser />}>Profile</MenuItem>
                    <Divider />
                    <MenuItem 
                      icon={<FiLogOut />} 
                      onClick={handleLogout}
                      color="red.500"
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </Flex>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxW="container.xl" py={8}>
          {activeTab === 0 && (
            <Box mb={6}>
              {/* Project Stats */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={4} mb={6}>
                <Card bg={statCardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Total Projects</StatLabel>
                      <StatNumber>{stats.total}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {stats.total > 0 ? '100' : '0'}%
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg={statCardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Active Projects</StatLabel>
                      <StatNumber>{stats.active}</StatNumber>
                      <Badge colorScheme="green">In Progress</Badge>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg={statCardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Completed</StatLabel>
                      <StatNumber>{stats.completed}</StatNumber>
                      <Badge colorScheme="blue">Done</Badge>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg={statCardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Delayed Projects</StatLabel>
                      <StatNumber>{stats.delayed}</StatNumber>
                      <Badge colorScheme="red">Attention Needed</Badge>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg={statCardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Upcoming Deadlines</StatLabel>
                      <StatNumber>{stats.upcomingDeadlines}</StatNumber>
                      <Badge colorScheme="orange">Next 7 Days</Badge>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg={statCardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>High Priority</StatLabel>
                      <StatNumber>{stats.highPriority}</StatNumber>
                      <Badge colorScheme="purple">Priority Tasks</Badge>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Search and Filters */}
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={6}>
                <InputGroup maxW={{ base: "100%", md: "400px" }}>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  maxW={{ base: "100%", md: "200px" }}
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                  <option value="on-hold">On Hold</option>
                </Select>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  maxW={{ base: "100%", md: "200px" }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Priority</option>
                  <option value="deadline">Deadline</option>
                </Select>
              </Stack>
            </Box>
          )}

          <TabPanels>
            <TabPanel px={0}>
              <ProjectList
                projects={filteredProjects}
                onEdit={(project) => {
                  setSelectedProject(project);
                  onOpen();
                }}
                onDelete={handleDeleteProject}
                onViewAnalytics={handleViewAnalytics}
              />
            </TabPanel>
            <TabPanel px={0}>
              <ProjectAnalytics
                projects={projects || []}
                selectedProject={selectedProject}
                isLoading={isLoading}
              />
            </TabPanel>
          </TabPanels>
        </Container>
      </Tabs>

      <ProjectForm
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedProject(null);
        }}
        onSubmit={handleCreateProject}
        initialData={selectedProject}
        isLoading={createProject.isLoading}
      />
    </Box>
  );
} 
