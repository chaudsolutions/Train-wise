import { useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { useLogout } from "../../Hooks/useLogout";

const Logout = () => {
  const { logout } = useLogout();
  const queryClient = useQueryClient(); // Get the query client

  const logOut = async () => {
    logout();
    queryClient.clear(); // Invalidate all queries
  };

  return (
    <button className="log-out" onClick={logOut}>
      Log Out
    </button>
  );
};

export default Logout;
