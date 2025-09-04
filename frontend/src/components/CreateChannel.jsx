import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { XIcon, UserPlusIcon, XCircleIcon, LoaderIcon } from "lucide-react";
import { createChannel, searchUsers } from "../lib/api";
import toast from "react-hot-toast";
import { useDebounce } from "../hooks/useDebounce";

const CreateChannel = ({ onCancel, onChannelCreated }) => {
  const [channelName, setChannelName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["searchUsers", debouncedSearchQuery],
    queryFn: () => searchUsers(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0,
  });

  const { mutate: createChannelMutation, isPending } = useMutation({
    mutationFn: createChannel,
    onSuccess: () => {
      toast.success("Channel created successfully!");
      onChannelCreated();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create channel");
    },
  });

  const handleAddMember = (user) => {
    if (!selectedMembers.find(member => member._id === user._id)) {
      setSelectedMembers([...selectedMembers, user]);
      setSearchQuery("");
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(member => member._id !== userId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      toast.error("Channel name is required");
      return;
    }

    const memberIds = selectedMembers.map(member => member._id);
    
    createChannelMutation({
      name: channelName.trim(),
      members: memberIds,
    });
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="card-title text-2xl">Create New Channel</h2>
              <button
                onClick={onCancel}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Channel Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Channel Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter channel name"
                  className="input input-bordered w-full"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  required
                />
              </div>

              {/* Add Members */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Add Members</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <UserPlusIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 size-5 text-base-content/50" />
                </div>

                {/* Search Results */}
                {searchQuery && (
                  <div className="mt-2 max-h-40 overflow-y-auto bg-base-100 border border-base-300 rounded-lg">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <span className="loading loading-spinner loading-sm"></span>
                      </div>
                    ) : searchResults?.length === 0 ? (
                      <div className="p-4 text-center text-base-content/70">
                        No users found
                      </div>
                    ) : (
                      searchResults?.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleAddMember(user)}
                          className="p-3 hover:bg-base-200 cursor-pointer flex items-center gap-3 border-b border-base-300 last:border-b-0"
                        >
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img src={user.profilePic} alt={user.fullName} />
                            </div>
                          </div>
                          <span className="font-medium">{user.fullName}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Selected Members ({selectedMembers.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-2 bg-primary text-primary-content px-3 py-1 rounded-full"
                      >
                        <span>{member.fullName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member._id)}
                          className="btn btn-ghost btn-xs btn-circle"
                        >
                          <XCircleIcon className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="form-control mt-6">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary"
                >
                  {isPending ? (
                    <>
                      <LoaderIcon className="animate-spin size-4" />
                      Creating...
                    </>
                  ) : (
                    "Create Channel"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChannel;
