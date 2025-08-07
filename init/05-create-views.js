
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

// ===============================================================
// iam-database-mongo/init/05-create-views.js
// ===============================================================

db = db.getSiblingDB('iam_chat_db');

// Create view for chat room summary
db.createView("chat_room_summary", "chat_rooms", [
  {
    $lookup: {
      from: "chat_members",
      localField: "_id", 
      foreignField: "chatRoomId",
      as: "members"
    }
  },
  {
    $lookup: {
      from: "messages",
      let: { roomId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$chatRoomId", "$$roomId"] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
      ],
      as: "lastMessage"
    }
  },
  {
    $addFields: {
      memberCount: { $size: { $filter: { input: "$members", cond: { $eq: ["$$this.isActive", true] } } } },
      lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
      unreadCount: 0 // Will be calculated per user
    }
  },
  {
    $project: {
      name: 1,
      description: 1,
      type: 1,
      isActive: 1,
      isPrivate: 1,
      organizationId: 1,
      departmentId: 1,
      memberCount: 1,
      lastMessage: {
        content: 1,
        senderId: 1,
        senderName: 1,
        createdAt: 1,
        messageType: 1
      },
      createdAt: 1,
      lastActivity: 1
    }
  }
]);

// Create view for user's active chats
db.createView("user_active_chats", "chat_members", [
  {
    $match: { isActive: true }
  },
  {
    $lookup: {
      from: "chat_rooms",
      localField: "chatRoomId",
      foreignField: "_id",
      as: "chatRoom"
    }
  },
  {
    $unwind: "$chatRoom"
  },
  {
    $lookup: {
      from: "messages",
      let: { roomId: "$chatRoomId", lastRead: "$lastReadMessageId" },
      pipeline: [
        { 
          $match: { 
            $expr: { 
              $and: [
                { $eq: ["$chatRoomId", "$$roomId"] },
                { $gt: ["$_id", "$$lastRead"] },
                { $eq: ["$isDeleted", false] }
              ]
            }
          }
        },
        { $count: "unreadCount" }
      ],
      as: "unreadMessages"
    }
  },
  {
    $addFields: {
      unreadCount: { 
        $ifNull: [
          { $arrayElemAt: ["$unreadMessages.unreadCount", 0] }, 
          0
        ]
      }
    }
  },
  {
    $project: {
      userId: 1,
      chatRoomId: 1,
      role: 1,
      joinedAt: 1,
      lastSeenAt: 1,
      unreadCount: 1,
      chatRoom: {
        name: 1,
        description: 1,
        type: 1,
        isPrivate: 1,
        lastActivity: 1
      }
    }
  }
]);

print('✅ MongoDB views created');
