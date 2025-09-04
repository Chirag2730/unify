import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, HashIcon, UsersIcon } from "lucide-react";
import { getUserChannels } from "../lib/api";
import { useNavigate } from "react-router";
import CreateChannel from "../components/CreateChannel";

const ChannelsListPage = () => {
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const navigate = useNavigate();

  const { data: channels, isLoading, refetch } = useQuery({
    queryKey: ["userChannels"],
    queryFn: getUserChannels,
  });
  const handleChannelClick = (channelId) => {
    navigate(`/channels/${channelId}`);
  };

  const handleChannelCreated = () => {
    setShowCreateChannel(false);
    refetch(); // Refresh the channels list
  };

  if (showCreateChannel) {
    return (
      <CreateChannel 
        onCancel={() => setShowCreateChannel(false)}
        onChannelCreated={handleChannelCreated}
      />
    );
  }
  
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Channels</h1>
            <p className="text-base-content/70">Manage your channels and conversations</p>
          </div>
          <button
            onClick={() => setShowCreateChannel(true)}
            className="btn btn-primary gap-2"
          >
            <PlusIcon className="size-4" />
            Create Channel
          </button>
        </div>

        {/* Channels List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid gap-4">
            {channels?.length === 0 ? (
              <div className="text-center py-12">
                <HashIcon className="size-16 mx-auto text-base-content/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No channels yet</h3>
                <p className="text-base-content/70 mb-4">
                  Create your first channel to start collaborating with others
                </p>
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="btn btn-primary"
                >
                  Create Your First Channel
                </button>
              </div>
            ) : (
              channels?.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => handleChannelClick(channel.id)}
                  className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-12">
                        <HashIcon className="size-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{channel.name || channel.id}</h3>
                      <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <UsersIcon className="size-4" />
                        <span>{channel.memberCount || 0} members</span>
                      </div>
                    </div>
                    <div className="text-xs text-base-content/50">
                      {new Date(channel.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelsListPage;
