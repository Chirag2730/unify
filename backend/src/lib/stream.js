import { StreamChat } from "stream-chat";
import "dotenv/config";

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error Upserting Stream User:", error);
  }
}

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

if (!STREAM_API_KEY || !STREAM_API_SECRET) {
  throw new Error("Stream API credentials are required");
}
export const streamClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);


export const generateStreamToken = (userId) => {
  return streamClient.createToken(userId);
};