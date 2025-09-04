
import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const StreamChatContext = createContext();

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const StreamChatProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initializeClient = async () => {
      if (!tokenData?.token || !authUser || chatClient || isConnecting) return;

      setIsConnecting(true);
      try {
        console.log("Initializing Stream Chat client...");
        
        const client = StreamChat.getInstance(STREAM_API_KEY);
        
        // Check if user is already connected
        if (client.userID !== authUser._id) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );
        }

        setChatClient(client);
        console.log("Stream Chat client initialized successfully");
      } catch (error) {
        console.error("Error initializing Stream Chat client:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeClient();

    // Cleanup function
    return () => {
      if (chatClient && !authUser) {
        console.log("Disconnecting Stream Chat client...");
        chatClient.disconnectUser();
        setChatClient(null);
      }
    };
  }, [tokenData, authUser]);

  // Disconnect when user logs out
  useEffect(() => {
    if (!authUser && chatClient) {
      console.log("User logged out, disconnecting Stream Chat client...");
      chatClient.disconnectUser();
      setChatClient(null);
    }
  }, [authUser, chatClient]);

  const value = {
    chatClient,
    isConnecting,
  };

  return (
    <StreamChatContext.Provider value={value}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error("useStreamChat must be used within a StreamChatProvider");
  }
  return context;
};
