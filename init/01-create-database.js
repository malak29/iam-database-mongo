
// Switch to admin database for user creation
db = db.getSiblingDB('admin');

// Create chat service user
db.createUser({
  user: 'iam_chat_user',
  pwd: 'ChatUser123',
  roles: [
    {
      role: 'readWrite',
      db: 'iam_chat_db'
    },
    {
      role: 'dbAdmin',
      db: 'iam_chat_db'  
    }
  ]
});

print('✅ Chat service user created');

// Switch to chat database
db = db.getSiblingDB('iam_chat_db');

// Create collections with schema validation
db.createCollection('chat_rooms', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'type', 'createdBy', 'createdAt'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string', minLength: 1, maxLength: 100 },
        description: { bsonType: 'string', maxLength: 500 },
        type: { enum: ['DIRECT', 'GROUP', 'CHANNEL', 'ANNOUNCEMENT'] },
        isActive: { bsonType: 'bool' },
        isPrivate: { bsonType: 'bool' },
        maxMembers: { bsonType: 'number', minimum: 2, maximum: 1000 },
        organizationId: { bsonType: 'number' },
        departmentId: { bsonType: 'number' },
        createdBy: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
        lastActivity: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['chatRoomId', 'senderId', 'content', 'createdAt'],
      properties: {
        _id: { bsonType: 'objectId' },
        chatRoomId: { bsonType: 'objectId' },
        senderId: { bsonType: 'string' },
        senderName: { bsonType: 'string' },
        content: { bsonType: 'string', minLength: 1, maxLength: 4000 },
        messageType: { enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'] },
        replyToMessageId: { bsonType: 'objectId' },
        isEdited: { bsonType: 'bool' },
        isDeleted: { bsonType: 'bool' },
        editedAt: { bsonType: 'date' },
        deletedAt: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        reactions: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              userId: { bsonType: 'string' },
              emoji: { bsonType: 'string' },
              createdAt: { bsonType: 'date' }
            }
          }
        }
      }
    }
  }
});

db.createCollection('chat_members', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['chatRoomId', 'userId', 'joinedAt'],
      properties: {
        _id: { bsonType: 'objectId' },
        chatRoomId: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        userName: { bsonType: 'string' },
        role: { enum: ['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER'] },
        isActive: { bsonType: 'bool' },
        joinedAt: { bsonType: 'date' },
        leftAt: { bsonType: 'date' },
        lastReadMessageId: { bsonType: 'objectId' },
        lastSeenAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('user_presence', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'status', 'lastSeen'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        status: { enum: ['ONLINE', 'AWAY', 'BUSY', 'OFFLINE'] },
        statusMessage: { bsonType: 'string', maxLength: 100 },
        lastSeen: { bsonType: 'date' },
        deviceInfo: { bsonType: 'string' },
        ipAddress: { bsonType: 'string' }
      }
    }
  }
});

print('✅ Collections created with schema validation');
