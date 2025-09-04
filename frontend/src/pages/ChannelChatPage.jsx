
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getStreamToken } from "../lib/api";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { StreamChat } from "stream-chat";
import ChatLoader from "../components/ChatLoader";
import { useParams } from "react-router";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChannelChatPage = () => {
  const { channelId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !channelId) return;

      try {
        console.log("Initializing stream chat client for channel...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        // Get the specific channel
        const currChannel = client.channel("messaging", channelId);
        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing channel chat:", error);
        toast.error("Could not connect to channel. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, channelId]);

  if (loading || !chatClient || !channel) return <ChatLoader />;
  
  const handleVideoCall = () => {
      if (channel) {
        const callUrl = `${window.location.origin}/call/${channel.id}`;
  
        channel.sendMessage({
          text: `I've started a video call. Join me here: ${callUrl}`,
        });
  
        toast.success("Video call link sent successfully!");
      }
    };

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChannelChatPage;
