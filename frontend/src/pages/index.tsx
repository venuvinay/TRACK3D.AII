import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Center, Spinner } from '@chakra-ui/react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <Center h="100vh">
      <Box>
        <Spinner size="xl" />
      </Box>
    </Center>
  );
} 