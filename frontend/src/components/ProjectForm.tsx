import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  Text,
  useToast,
  SimpleGrid,
  Switch,
  HStack,
  Tooltip,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { FiInfo, FiPlus } from 'react-icons/fi';

interface ProjectFormData {
  title: string;
  description: string;
  startDate: string;
  expectedEndDate: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'delayed';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  isPublic: boolean;
  budget: {
    estimated: number;
    spent: number;
  };
  progress: {
    completed: number;
  };
  team?: string[];
  milestones?: Array<{
    title: string;
    dueDate: string;
    completed: boolean;
  }>;
}

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<ProjectFormData>;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}) => {
  const toast = useToast();
  const [tagInput, setTagInput] = React.useState('');
  const [milestones, setMilestones] = React.useState<Array<{ title: string; dueDate: string; completed: boolean }>>([]);
  const [teamMembers, setTeamMembers] = React.useState<string[]>([]);
  const [teamMemberInput, setTeamMemberInput] = React.useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProjectFormData>({
    defaultValues: initialData || {
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '',
      status: 'planning',
      priority: 'medium',
      tags: [],
      isPublic: false,
      budget: {
        estimated: 0,
        spent: 0,
      },
      progress: {
        completed: 0,
      },
      team: [],
      milestones: [],
    },
  });

  const startDate = watch('startDate');
  const progress = watch('progress.completed');

  // Reset form when modal opens/closes or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        expectedEndDate: '',
        status: 'planning',
        priority: 'medium',
        tags: [],
        isPublic: false,
        budget: {
          estimated: 0,
          spent: 0,
        },
        progress: {
          completed: 0,
        },
        team: [],
        milestones: [],
      });
      setMilestones(initialData?.milestones || []);
      setTeamMembers(initialData?.team || []);
    }
  }, [isOpen, initialData, reset]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = new Set([...watch('tags'), tagInput.trim()]);
      reset({ ...watch(), tags: Array.from(newTags) });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = watch('tags').filter(tag => tag !== tagToRemove);
    reset({ ...watch(), tags: newTags });
  };

  const handleAddTeamMember = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && teamMemberInput.trim()) {
      e.preventDefault();
      const newTeam = new Set([...teamMembers, teamMemberInput.trim()]);
      setTeamMembers(Array.from(newTeam));
      setTeamMemberInput('');
    }
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: '', dueDate: new Date().toISOString().split('T')[0], completed: false },
    ]);
  };

  const handleFormSubmit = (data: ProjectFormData) => {
    try {
      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.expectedEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast({
          title: 'Invalid dates',
          description: 'Please enter valid dates',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (endDate < startDate) {
        toast({
          title: 'Invalid dates',
          description: 'End date must be after start date',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Format the data
      const formattedData = {
        ...data,
        team: teamMembers,
        milestones,
        budget: {
          estimated: Number(data.budget.estimated) || 0,
          spent: Number(data.budget.spent) || 0,
        },
        progress: {
          completed: Number(data.progress.completed) || 0,
        },
      };
      
      onSubmit(formattedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error processing your request',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            {initialData ? 'Edit Project' : 'Create New Project'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel>Project Title</FormLabel>
                <Input
                  {...register('title', {
                    required: 'Project title is required',
                    minLength: {
                      value: 3,
                      message: 'Title must be at least 3 characters',
                    },
                  })}
                  placeholder="Enter project title"
                />
                {errors.title && (
                  <Text color="red.500" fontSize="sm">
                    {errors.title.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters',
                    },
                  })}
                  placeholder="Enter project description"
                />
                {errors.description && (
                  <Text color="red.500" fontSize="sm">
                    {errors.description.message}
                  </Text>
                )}
              </FormControl>

              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl isRequired isInvalid={!!errors.startDate}>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    {...register('startDate', {
                      required: 'Start date is required',
                    })}
                  />
                  {errors.startDate && (
                    <Text color="red.500" fontSize="sm">
                      {errors.startDate.message}
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.expectedEndDate}>
                  <FormLabel>Expected End Date</FormLabel>
                  <Input
                    type="date"
                    min={startDate}
                    {...register('expectedEndDate', {
                      required: 'Expected end date is required',
                      validate: value => 
                        new Date(value) > new Date(startDate) || 
                        'End date must be after start date'
                    })}
                  />
                  {errors.expectedEndDate && (
                    <Text color="red.500" fontSize="sm">
                      {errors.expectedEndDate.message}
                    </Text>
                  )}
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select {...register('status')}>
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                    <option value="on-hold">On Hold</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Priority</FormLabel>
                  <Select {...register('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type and press Enter to add tags"
                />
                <Wrap spacing={2} mt={2}>
                  {watch('tags')?.map((tag) => (
                    <WrapItem key={tag}>
                      <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>

              <FormControl>
                <FormLabel>Team Members</FormLabel>
                <Input
                  value={teamMemberInput}
                  onChange={(e) => setTeamMemberInput(e.target.value)}
                  onKeyDown={handleAddTeamMember}
                  placeholder="Type email and press Enter to add team member"
                />
                <Wrap spacing={2} mt={2}>
                  {teamMembers.map((member) => (
                    <WrapItem key={member}>
                      <Tag size="md" borderRadius="full" variant="solid" colorScheme="green">
                        <TagLabel>{member}</TagLabel>
                        <TagCloseButton 
                          onClick={() => setTeamMembers(teamMembers.filter(m => m !== member))} 
                        />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>

              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Estimated Budget</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField {...register('budget.estimated')} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Spent Budget</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField {...register('budget.spent')} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Progress (%)</FormLabel>
                <HStack spacing={4}>
                  <NumberInput
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(value) => reset({ ...watch(), progress: { completed: Number(value) } })}
                    flex={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Progress value={progress} width="100px" />
                </HStack>
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>Milestones</FormLabel>
                  <IconButton
                    size="sm"
                    icon={<FiPlus />}
                    aria-label="Add milestone"
                    onClick={handleAddMilestone}
                  />
                </HStack>
                <VStack spacing={2} mt={2}>
                  {milestones.map((milestone, index) => (
                    <HStack key={index} width="100%" spacing={2}>
                      <Input
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...milestones];
                          newMilestones[index].title = e.target.value;
                          setMilestones(newMilestones);
                        }}
                      />
                      <Input
                        type="date"
                        value={milestone.dueDate}
                        min={startDate}
                        onChange={(e) => {
                          const newMilestones = [...milestones];
                          newMilestones[index].dueDate = e.target.value;
                          setMilestones(newMilestones);
                        }}
                      />
                      <Switch
                        isChecked={milestone.completed}
                        onChange={(e) => {
                          const newMilestones = [...milestones];
                          newMilestones[index].completed = e.target.checked;
                          setMilestones(newMilestones);
                        }}
                      />
                      <IconButton
                        size="sm"
                        icon={<FiInfo />}
                        aria-label="Remove milestone"
                        onClick={() => {
                          const newMilestones = milestones.filter((_, i) => i !== index);
                          setMilestones(newMilestones);
                        }}
                      />
                    </HStack>
                  ))}
                </VStack>
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch {...register('isPublic')} />
                  <FormLabel mb={0}>Make Project Public</FormLabel>
                  <Tooltip label="Public projects are visible to all team members">
                    <IconButton
                      size="sm"
                      icon={<FiInfo />}
                      aria-label="Public project info"
                    />
                  </Tooltip>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
            >
              {initialData ? 'Update Project' : 'Create Project'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ProjectForm; 