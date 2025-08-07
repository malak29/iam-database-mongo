
db = db.getSiblingDB('iam_chat_db');

// Create stored functions for common operations

// Function to get unread message count for a user in a chat room
db.system.js.save({
  _id: "getUnreadMessageCount",
  value: function(chatRoomId, userId, lastReadMessageId) {
    var query = {
      chatRoomId: ObjectId(chatRoomId),
      isDeleted: false
    };
    
    if (lastReadMessageId) {
      query._id = { $gt: ObjectId(lastReadMessageId) };
    }
    
    return db.messages.countDocuments(query);
  }
});

// Function to get active users in a chat room
db.system.js.save({
  _id: "getActiveChatMembers",
  value: function(chatRoomId) {
    return db.chat_members.find({
      chatRoomId: ObjectId(chatRoomId),
      isActive: true
    }).toArray();
  }
});

// Function to update user's last seen in chat room
db.system.js.save({
  _id: "updateUserLastSeen",
  value: function(chatRoomId, userId, messageId) {
    return db.chat_members.updateOne(
      { 
        chatRoomId: ObjectId(chatRoomId), 
        userId: userId 
      },
      { 
        $set: { 
          lastReadMessageId: ObjectId(messageId),
          lastSeenAt: new Date()
        }
      }
    );
  }
});

print('✅ MongoDB functions created');
