
import { useAuth, AuthOptions } from "@/hooks/useAuth";

export const useCustomerAuth = (options: AuthOptions = { redirectIfNotAuthenticated: true }) => {
  const { session, userProfile, handleLogout, isLoading } = useAuth(options);

  // Add customer-specific functionality here if needed in the future

  return { 
    session, 
    userProfile, 
    handleLogout,
    isLoading 
  };
};
