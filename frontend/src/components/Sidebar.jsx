import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import useMobileMenu from "../hooks/useMobileMenu";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";
import { 
  BellDotIcon, 
  BellIcon, 
  GroupIcon, 
  HashIcon, 
  HomeIcon, 
  ShipWheelIcon, 
  UsersIcon,
  XIcon 
} from "lucide-react";
import { useEffect } from "react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const { isOpen, close } = useMobileMenu();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });
  const incomingRequests = friendRequests?.incomingReqs || [];

  // Close mobile menu when route changes
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Close mobile menu when clicking outside (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('.hamburger-btn')) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Unify
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          {incomingRequests.length > 0 ? (
            <BellDotIcon className="size-5 text-base-content opacity-70" />
          ) : (
            <BellIcon className="size-5 text-base-content opacity-70" />
          )}
          <span>Notifications</span>
        </Link>

        <Link
          to="/channels"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/channels" || currentPath.startsWith("/channels") ? "btn-active" : ""
          }`}
        >
          <HashIcon className="size-5 text-base-content opacity-70" />
          <span>Channels</span>
        </Link>

      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <aside className="mobile-sidebar w-64 bg-base-200 border-r border-base-300 flex flex-col h-screen fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out">
            {/* Close button for mobile */}
            <div className="flex justify-end p-2 lg:hidden">
              <button
                onClick={close}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;