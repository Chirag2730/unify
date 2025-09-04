import { generateStreamToken, streamClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const getUserChannels = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // Get channels where the user is a member using Stream Chat
    const filter = {
      type: 'messaging',
      members: { $in: [userId] }
    };
    
    const sort = { last_message_at: -1 };
    
    const channels = await streamClient.queryChannels(filter, sort, {
      watch: false,
      state: true,
    });

    // Filter channels to only include those with more than 2 members
    // and format the response properly
    const formattedChannels = channels
      .filter(channel => {
        const memberCount = Object.keys(channel.state.members || {}).length;
        return memberCount > 2; // Only show group channels (more than 2 members)
      })
      .map(channel => {
        const members = channel.state.members || {};
        const memberCount = Object.keys(members).length;
        const lastMessage = channel.state.messages?.[channel.state.messages.length - 1];
        return {
          id: channel.id,
          name: channel.data.name || `Channel ${channel.id}`,
          members: Object.values(members).map(member => ({
            id: member.user_id,
            name: member.user?.name || 'Unknown User',
            image: member.user?.image || '',
          })),
          memberCount,
          lastMessage: lastMessage ? {
            text: lastMessage.text || '',
            user: lastMessage.user?.name || 'Unknown',
            created_at: lastMessage.created_at,
          } : null,
          createdAt: channel.data.created_at,
          updatedAt: channel.data.updated_at || channel.state.last_message_at,
        };
      });

    res.status(200).json(formattedChannels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createChannel = async (req, res) => {
  try {
    const { name, members = [] } = req.body;
    const creatorId = req.user._id.toString();

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Channel name is required" });
    }

    if (members.length < 1) {
      return res.status(400).json({ message: "At least one member is required besides yourself" });
    }

    // Create a unique channel ID
    const channelId = `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // All members including the creator
    const allMembers = [...new Set([...members, creatorId])];

    // Create channel using Stream Chat
    const channel = streamClient.channel('messaging', channelId, {
      name: name.trim(),
      created_by_id: creatorId,
      members: allMembers,
    });

    await channel.create(creatorId);

    // Get the created channel data
    const channelData = {
      id: channel.id,
      name: channel.data.name,
      members: allMembers,
      memberCount: allMembers.length,
      createdBy: creatorId,
      createdAt: new Date(),
    };

    res.status(201).json(channelData);
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const searchUsersByName = async (req, res) => {
//   try {
//     const { query } = req.query;
//     const currentUserId = req.user._id;

//     if (!query || query.trim().length === 0) {
//       return res.status(400).json({ message: "Search query is required" });
//     }

//     // Import User model for searching
//     const { default: User } = await import("../models/User.js");

//     // Search for users by name (excluding current user)
//     const users = await User.find({
//       _id: { $ne: currentUserId },
//       $or: [
//         { fullName: { $regex: query, $options: 'i' } },
//         { email: { $regex: query, $options: 'i' } }
//       ]
//     })
//     .select('fullName email profilePic')
//     .limit(10);

//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error searching users:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
