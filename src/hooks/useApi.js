import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

// Custom hook for API queries with error handling
export const useApiQuery = (key, queryFn, options = {}) => {
  return useQuery(key, queryFn, {
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      if (!options.silent) {
        toast.error(message);
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Custom hook for API mutations with success/error handling
export const useApiMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation(mutationFn, {
    onSuccess: (data, variables, context) => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries(key);
        });
      }
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      if (!options.silent) {
        toast.error(options.errorMessage || message);
      }
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};