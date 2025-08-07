db = db.getSiblingDB('iam_chat_db');

// Create default chat rooms
const generalRoomId = new ObjectId();
const announcementsRoomId = new ObjectId();
const techDiscussionRoomId = new ObjectId();

db.chat_rooms.insertMany([
  {
    _id: generalRoomId,
    name: "General",
    description: "General discussion for all team members",
    type: "CHANNEL",
    isActive: true,
    isPrivate: false,
    maxMembers: 1000,
    organizationId: 1,
    departmentId: null,
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivity: new Date()
  },
  {
    _id: announcementsRoomId,
    name: "Announcements",
    description: "Important company announcements",
    type: "ANNOUNCEMENT",
    isActive: true,
    isPrivate: false,
    maxMembers: 1000,
    organizationId: 1,
    departmentId: null,
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivity: new Date()
  },
  {
    _id: techDiscussionRoomId,
    name: "Tech Discussion",
    description: "Technical discussions and Q&A",
    type: "GROUP",
    isActive: true,
    isPrivate: false,
    maxMembers: 100,
    organizationId: 1,
    departmentId: 1,
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivity: new Date()
  }
]);

// Create welcome messages
db.messages.insertMany([
  {
    chatRoomId: generalRoomId,
    senderId: "system",
    senderName: "System",
    content: "Welcome to the General chat! This is where team members can have casual conversations.",
    messageType: "SYSTEM",
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(),
    reactions: []
  },
  {
    chatRoomId: announcementsRoomId,
    senderId: "system", 
    senderName: "System",
    content: "This channel is for important company announcements. Only administrators can post here.",
    messageType: "SYSTEM",
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(),
    reactions: []
  },
  {
    chatRoomId: techDiscussionRoomId,
    senderId: "system",
    senderName: "System", 
    content: "Welcome to Tech Discussion! Share your technical questions, solutions, and insights here.",
    messageType: "SYSTEM",
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(),
    reactions: []
  }
]);

print('✅ Seed data created');
print('📊 Chat rooms created: ' + db.chat_rooms.countDocuments());
print('💬 Welcome messages created: ' + db.messages.countDocuments());
