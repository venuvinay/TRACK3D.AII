import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Link,
  Container,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      await registerUser(data.name, data.email, data.password);
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please try again with different credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={4} align="stretch">
          <Heading textAlign="center" mb={6}>
            Register for Construction Analytics
          </Heading>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
                {errors.name && (
                  <Text color="red.500" fontSize="sm">
                    {errors.name.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm">
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
                {errors.password && (
                  <Text color="red.500" fontSize="sm">
                    {errors.password.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === password || 'Passwords do not match',
                  })}
                />
                {errors.confirmPassword && (
                  <Text color="red.500" fontSize="sm">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
              >
                Register
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" mt={4}>
            Already have an account?{' '}
            <Link color="blue.500" href="/login">
              Login here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
} 