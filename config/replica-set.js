// Initialize MongoDB Replica Set for Production

// Wait for MongoDB to be ready
sleep(5000);

// Check if replica set is already initialized
try {
  rs.status();
  print("Replica set already initialized");
} catch (e) {
  print("Initializing replica set...");
  
  rs.initiate({
    _id: "iam-rs",
    members: [
      { _id: 0, host: "mongo-primary:27017", priority: 2 },
      { _id: 1, host: "mongo-secondary1:27017", priority: 1 },
      { _id: 2, host: "mongo-secondary2:27017", priority: 1 }
    ]
  });
  
  print("Replica set initialized successfully");
}

// Wait for primary election
sleep(10000);

// Print replica set status
rs.status();