import React from 'react';
import { Text } from '@chakra-ui/react';
import { format } from 'date-fns';

const ProjectList: React.FC = () => {
  // Assuming project is defined in the component's state or props
  const project = {
    endDate: '2024-05-15' // Example end date
  };

  return (
    <div>
      {/* Assuming project.endDate is available in the project object */}
      <Text fontSize="sm" color="gray.500">End Date</Text>
      <Text fontSize="sm">
        {project.endDate 
          ? format(new Date(project.endDate), 'MMM d, yyyy')
          : 'No end date set'}
      </Text>
    </div>
  );
};

export default ProjectList; 