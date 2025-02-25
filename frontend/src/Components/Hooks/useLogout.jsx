import { useAuthContext } from "../Context/AuthContext";

export const useLogout = () => {
  const { logout } = useAuthContext();

  return { logout };
};
