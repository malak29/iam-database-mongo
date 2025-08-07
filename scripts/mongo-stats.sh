#!/bin/bash

echo -e "${BLUE}📊 MongoDB Statistics for IAM Chat Service${NC}"

# Database stats
docker exec iam-mongo mongosh iam_chat_db --quiet --eval "
  print('📊 Database Statistics:');
  print('======================');
  
  var stats = db.stats();
  print('Database Size: ' + (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB');
  print('Index Size: ' + (stats.indexSize / 1024 / 1024).toFixed(2) + ' MB');
  print('Collections: ' + stats.collections);
  print('');
  
  print('📁 Collection Counts:');
  print('====================');
  print('Chat Rooms: ' + db.chat_rooms.countDocuments());
  print('Messages: ' + db.messages.countDocuments());  
  print('Chat Members: ' + db.chat_members.countDocuments());
  print('User Presence: ' + db.user_presence.countDocuments());
  print('');
  
  print('💬 Recent Activity:');
  print('==================');
  var recentMessages = db.messages.countDocuments({
    createdAt: { \$gte: new Date(Date.now() - 24*60*60*1000) }
  });
  print('Messages (24h): ' + recentMessages);
  
  var activeUsers = db.user_presence.countDocuments({
    status: { \$in: ['ONLINE', 'AWAY'] }
  });
  print('Active Users: ' + activeUsers);
  
  print('');
  print('🔍 Top Chat Rooms by Message Count:');
  print('===================================');
  db.messages.aggregate([
    { \$group: { _id: '\$chatRoomId', messageCount: { \$sum: 1 } } },
    { \$sort: { messageCount: -1 } },
    { \$limit: 5 },
    { \$lookup: { from: 'chat_rooms', localField: '_id', foreignField: '_id', as: 'room' } },
    { \$unwind: '\$room' },
    { \$project: { roomName: '\$room.name', messageCount: 1, _id: 0 } }
  ]).forEach(function(doc) {
    print(doc.roomName + ': ' + doc.messageCount + ' messages');
  });
"
