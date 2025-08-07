
db = db.getSiblingDB('iam_chat_db');

// Chat Rooms Indexes
db.chat_rooms.createIndex({ "type": 1 });
db.chat_rooms.createIndex({ "organizationId": 1 });
db.chat_rooms.createIndex({ "departmentId": 1 });
db.chat_rooms.createIndex({ "isActive": 1 });
db.chat_rooms.createIndex({ "createdBy": 1 });
db.chat_rooms.createIndex({ "lastActivity": -1 });
db.chat_rooms.createIndex({ "name": "text", "description": "text" }); // Text search

// Messages Indexes  
db.messages.createIndex({ "chatRoomId": 1, "createdAt": -1 }); // Most important - chat history
db.messages.createIndex({ "senderId": 1, "createdAt": -1 });
db.messages.createIndex({ "messageType": 1 });
db.messages.createIndex({ "isDeleted": 1 });
db.messages.createIndex({ "replyToMessageId": 1 });
db.messages.createIndex({ "content": "text" }); // Text search in messages

// Chat Members Indexes
db.chat_members.createIndex({ "chatRoomId": 1, "isActive": 1 });
db.chat_members.createIndex({ "userId": 1, "isActive": 1 });
db.chat_members.createIndex({ "chatRoomId": 1, "userId": 1 }, { unique: true });
db.chat_members.createIndex({ "role": 1 });
db.chat_members.createIndex({ "lastSeenAt": -1 });

// User Presence Indexes
db.user_presence.createIndex({ "userId": 1 }, { unique: true });
db.user_presence.createIndex({ "status": 1 });
db.user_presence.createIndex({ "lastSeen": -1 });

// Compound indexes for efficient queries
db.messages.createIndex({ "chatRoomId": 1, "isDeleted": 1, "createdAt": -1 });
db.chat_members.createIndex({ "userId": 1, "isActive": 1, "lastSeenAt": -1 });

print('✅ Database indexes created');
