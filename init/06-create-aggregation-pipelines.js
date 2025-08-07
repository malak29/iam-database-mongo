
db = db.getSiblingDB('iam_chat_db');

// Common aggregation pipelines saved as functions

// Get chat history with user info
db.system.js.save({
  _id: "getChatHistory", 
  value: function(chatRoomId, limit = 50, skip = 0) {
    return db.messages.aggregate([
      {
        $match: {
          chatRoomId: ObjectId(chatRoomId),
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "messages",
          localField: "replyToMessageId", 
          foreignField: "_id",
          as: "replyToMessage"
        }
      },
      {
        $addFields: {
          replyToMessage: { $arrayElemAt: ["$replyToMessage", 0] }
        }
      },
      {
        $sort: { createdAt: 1 } // Reverse back to chronological order
      }
    ]).toArray();
  }
});

// Get user's chat rooms with unread counts
db.system.js.save({
  _id: "getUserChatRooms",
  value: function(userId) {
    return db.chat_members.aggregate([
      {
        $match: {
          userId: userId,
          isActive: true
        }
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
        $match: {
          "chatRoom.isActive": true
        }
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
                    lastRead ? { $gt: ["$_id", "$$lastRead"] } : { $ne: [null, null] },
                    { $eq: ["$isDeleted", false] }
                  ]
                }
              }
            },
            { $count: "count" }
          ],
          as: "unreadMessages"
        }
      },
      {
        $lookup: {
          from: "messages",
          let: { roomId: "$chatRoomId" },
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
          unreadCount: {
            $ifNull: [
              { $arrayElemAt: ["$unreadMessages.count", 0] },
              0
            ]
          },
          lastMessage: { $arrayElemAt: ["$lastMessage", 0] }
        }
      },
      {
        $project: {
          chatRoomId: 1,
          role: 1,
          joinedAt: 1,
          lastSeenAt: 1,
          unreadCount: 1,
          chatRoom: {
            name: "$chatRoom.name",
            description: "$chatRoom.description", 
            type: "$chatRoom.type",
            isPrivate: "$chatRoom.isPrivate",
            lastActivity: "$chatRoom.lastActivity"
          },
          lastMessage: {
            content: 1,
            senderId: 1,
            senderName: 1,
            createdAt: 1,
            messageType: 1
          }
        }
      },
      {
        $sort: { "chatRoom.lastActivity": -1 }
      }
    ]).toArray();
  }
});

print('✅ Aggregation pipelines created');