import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import useMobileMenu from "../hooks/useMobileMenu";
import { 
  BellDotIcon, 
  BellIcon, 
  LogOutIcon, 
  ShipWheelIcon, 
  MenuIcon 
} from "lucide-react";
import { Link, useLocation } from "react-router";
import useLogout from "../hooks/useLogout";
import { getFriendRequests } from "../lib/api";
import ThemeSelector from "./ThemeSelector";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const isChannelChatPage = location.pathname?.startsWith("/channels/") && location.pathname !== "/channels";
  const { toggle } = useMobileMenu();

  const { logoutMutation } = useLogout();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });
  const incomingRequests = friendRequests?.incomingReqs || [];

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Left side - Hamburger menu (mobile) + Logo (chat pages) */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu - Only show on mobile */}
            <button
              onClick={toggle}
              className="hamburger-btn btn btn-ghost btn-circle lg:hidden"
            >
              <MenuIcon className="size-5" />
            </button>

            {/* LOGO - SHOW IN CHAT PAGES AND CHANNEL CHAT PAGES */}
            {(isChatPage || isChannelChatPage) && (
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Unify
                </span>
              </Link>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                {incomingRequests.length > 0 ? (
                  <BellDotIcon className="size-5 text-base-content opacity-70" />
                ) : (
                  <BellIcon className="size-5 text-base-content opacity-70" />
                )}
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar">
              <div className="w-9 rounded-full">
                <img
                  src={authUser?.profilePic}
                  alt="User Avatar"
                  rel="noreferrer"
                />
              </div>
            </div>

            {/* Logout button */}
            <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;