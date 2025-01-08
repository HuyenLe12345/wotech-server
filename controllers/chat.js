const Chat = require("../models/chat");
const io = require("../socket");
 // create new room
exports.createNewRoom = async (req, res) => {
  try {
    // Create a new chat room
    const chat = new Chat({ conversation: [] });
    await chat.save();

    // Log the newly created room ID
    console.log(chat);
    console.log("New chat room created with ID:", chat._id);

    // Emit an event to notify other parts of the application if needed
    io.getIO().emit("new_room_created", { roomId: chat._id });

    // Respond with the new room ID
    return res.status(200).json({ _id: chat._id });
  } catch (error) {
    console.error("Error creating new chat room:", error);
    return res.status(500).json({ error: "Failed to create new chat room" });
  }
};
// add message to room by roomId
exports.addMessage = async (req, res) => {
  const { message, roomId, is_admin } = req.body;
  // when user type "/end" to end the conversation
  if (message === "==END ROOM==") {
    await Chat.findByIdAndDelete(roomId);
    io.getIO().emit("delete-room", roomId);
    return res.status(200).json({ message: "This conversation is end" });
  }
  // fetch data by roomId
  const chat = await Chat.findById(roomId);

  const updatedConversation = chat.conversation || [];
  updatedConversation.push({ message, is_admin });
  chat.conversation = updatedConversation;
  await chat.save();

  return res.status(200).json({ message: "Send message successfully" });
};
// get message by roomId
exports.getMessageByRoomId = async (req, res) => {
  const { roomId } = req.query;
  if (!roomId || roomId === "null") {
    return res.status(400).json({ error: "Invalid room ID" });
  }
  const chat = await Chat.findById(roomId);
  if (!chat) {
    throw new Error("No room found");
  }
  return res.status(200).json({ content: chat.conversation });
};
