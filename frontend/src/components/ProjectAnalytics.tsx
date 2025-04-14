import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Heading,
  Text,
  Progress,
  useColorModeValue,
  Center,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Project {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  expectedEndDate: string;
  status: 'planning' | 'in-progress' | 'delayed' | 'completed';
  budget: {
    estimated: number;
    spent: number;
    breakdown: Array<{
      category: string;
      amount: number;
      spent: number;
    }>;
  };
  progress: {
    completed: number;
    planned: number;
  };
  analytics?: {
    performanceIndex: number;
    scheduleVariance: number;
    costVariance: number;
    riskIndex: number;
    qualityMetrics: {
      defects: number;
      rework: number;
      compliance: number;
    };
  };
}

interface ProjectAnalyticsProps {
  projects?: Project[];
  selectedProject?: Project;
  isLoading?: boolean;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({
  projects = [],
  selectedProject,
  isLoading = false,
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  console.log('Projects received:', projects); // Debug log

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Calculate overall statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const delayedProjects = projects.filter(p => p.status === 'delayed').length;
  const planningProjects = projects.filter(p => p.status === 'planning').length;

  const averageProgress = totalProjects > 0
    ? projects.reduce((acc, p) => acc + (p.progress?.completed || 0), 0) / totalProjects
    : 0;
  
  // Calculate budget metrics
  const totalEstimatedBudget = projects.reduce((acc, p) => acc + (p.budget?.estimated || 0), 0);
  const totalSpentBudget = projects.reduce((acc, p) => acc + (p.budget?.spent || 0), 0);
  const budgetUtilization = totalEstimatedBudget > 0 
    ? (totalSpentBudget / totalEstimatedBudget) * 100 
    : 0;

  // Calculate performance metrics
  const averagePerformanceIndex = projects.reduce((acc, p) => acc + (p.analytics?.performanceIndex || 1), 0) / totalProjects;
  const averageScheduleVariance = projects.reduce((acc, p) => acc + (p.analytics?.scheduleVariance || 0), 0) / totalProjects;
  const averageCostVariance = projects.reduce((acc, p) => acc + (p.analytics?.costVariance || 0), 0) / totalProjects;

  // Prepare data for status distribution chart
  const statusData = {
    labels: ['Planning', 'In Progress', 'Delayed', 'Completed'],
    datasets: [
      {
        label: 'Number of Projects',
        data: [planningProjects, activeProjects, delayedProjects, completedProjects],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for progress comparison chart
  const progressData = {
    labels: projects.map(p => p.title || 'Unnamed Project'),
    datasets: [
      {
        label: 'Completed Progress (%)',
        data: projects.map(p => p.progress?.completed || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barThickness: 30,
      }
    ],
  };

  // Prepare data for budget analysis chart
  const budgetData = {
    labels: projects.map(p => p.title || 'Unnamed Project'),
    datasets: [
      {
        label: 'Estimated Budget ($)',
        data: projects.map(p => p.budget?.estimated || 0),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Spent Budget ($)',
        data: projects.map(p => p.budget?.spent || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  console.log('Chart data:', { // Debug log
    statusData,
    progressData,
    budgetData
  });

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const statusChartOptions = {
    ...commonChartOptions,
    plugins: {
      legend: {
        position: 'top' as const,
        display: true,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Project Status Distribution',
      },
    },
  };

  const progressChartOptions = {
    ...commonChartOptions,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Project Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  const budgetChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Budget Distribution',
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };

  if (totalProjects === 0) {
    return (
      <Center h="50vh">
        <Box textAlign="center">
          <Heading size="md" mb={4}>No Projects Available</Heading>
          <Text color={textColor}>Add some projects to see analytics</Text>
        </Box>
      </Center>
    );
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Total Projects</StatLabel>
              <StatNumber>{totalProjects}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {((totalProjects / (totalProjects || 1)) * 100).toFixed(2)}%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Active Projects</StatLabel>
              <StatNumber>{activeProjects}</StatNumber>
              <StatHelpText>
                <StatArrow type={activeProjects >= totalProjects / 2 ? "increase" : "decrease"} />
                {((activeProjects / (totalProjects || 1)) * 100).toFixed(2)}%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Average Progress</StatLabel>
              <StatNumber>{averageProgress.toFixed(1)}%</StatNumber>
              <Progress
                value={averageProgress}
                size="sm"
                colorScheme="green"
                mt={2}
              />
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Budget Utilization</StatLabel>
              <StatNumber>{budgetUtilization.toFixed(1)}%</StatNumber>
              <StatHelpText>
                <Text fontSize="sm">
                  ${totalSpentBudget.toLocaleString()} / ${totalEstimatedBudget.toLocaleString()}
                </Text>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Card bg={cardBg}>
          <CardBody>
            <Heading size="md" mb={4}>Project Status Distribution</Heading>
            <Box height="300px">
              <Doughnut data={statusData} options={statusChartOptions} />
            </Box>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Heading size="md" mb={4}>Progress Comparison</Heading>
            <Box height="300px">
              <Bar data={progressData} options={progressChartOptions} />
            </Box>
          </CardBody>
        </Card>

        <Card bg={cardBg} gridColumn={{ lg: 'span 2' }}>
          <CardBody>
            <Heading size="md" mb={4}>Budget Analysis</Heading>
            <Box height="300px" position="relative">
              <Line 
                data={budgetData} 
                options={budgetChartOptions}
              />
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
              <Stat>
                <StatLabel>Total Estimated Budget</StatLabel>
                <StatNumber>${totalEstimatedBudget.toLocaleString()}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Spent</StatLabel>
                <StatNumber>${totalSpentBudget.toLocaleString()}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Budget Utilization</StatLabel>
                <StatNumber>{budgetUtilization.toFixed(1)}%</StatNumber>
                <Progress 
                  value={budgetUtilization} 
                  size="sm" 
                  colorScheme={budgetUtilization > 100 ? "red" : "green"} 
                  mt={2}
                />
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>
      </SimpleGrid>

      {selectedProject && (
        <Card bg={cardBg} mt={8}>
          <CardBody>
            <Heading size="md" mb={4}>Selected Project Details</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text color={textColor}>Project Title</Text>
                <Text fontSize="xl" fontWeight="bold">{selectedProject.title}</Text>
              </Box>
              <Box>
                <Text color={textColor}>Status</Text>
                <Text fontSize="xl" fontWeight="bold">{selectedProject.status}</Text>
              </Box>
              <Box>
                <Text color={textColor}>Progress</Text>
                <VStack align="stretch" spacing={2}>
                  <Text>Completed: {selectedProject.progress?.completed || 0}%</Text>
                  <Progress
                    value={selectedProject.progress?.completed || 0}
                    size="lg"
                    colorScheme="green"
                  />
                  <Text>Planned: {selectedProject.progress?.planned || 0}%</Text>
                  <Progress
                    value={selectedProject.progress?.planned || 0}
                    size="lg"
                    colorScheme="blue"
                  />
                </VStack>
              </Box>
              <Box>
                <Text color={textColor}>Budget</Text>
                <VStack align="stretch" spacing={2}>
                  <Text>Estimated: ${selectedProject.budget?.estimated?.toLocaleString() || 0}</Text>
                  <Text>Spent: ${selectedProject.budget?.spent?.toLocaleString() || 0}</Text>
                  <Progress
                    value={(selectedProject.budget?.spent || 0) / (selectedProject.budget?.estimated || 1) * 100}
                    size="lg"
                    colorScheme={
                      (selectedProject.budget?.spent || 0) > (selectedProject.budget?.estimated || 0)
                        ? "red"
                        : "green"
                    }
                  />
                </VStack>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default ProjectAnalytics; 