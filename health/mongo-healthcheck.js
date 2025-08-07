// MongoDB Health Check Script

db = db.getSiblingDB('iam_chat_db');

var healthCheck = {
  timestamp: new Date(),
  status: "unknown",
  checks: {}
};

try {
  // Test basic connectivity
  var pingResult = db.adminCommand("ping");
  healthCheck.checks.ping = pingResult.ok === 1 ? "PASS" : "FAIL";

  // Test authentication
  var authResult = db.runCommand({connectionStatus: 1});
  healthCheck.checks.auth = authResult.ok === 1 ? "PASS" : "FAIL";

  // Test read operations
  var readResult = db.chat_rooms.findOne();
  healthCheck.checks.read = readResult !== null ? "PASS" : "FAIL";

  // Test write operations
  var writeTest = db.health_test.insertOne({test: true, timestamp: new Date()});
  healthCheck.checks.write = writeTest.acknowledged ? "PASS" : "FAIL";
  db.health_test.deleteOne({_id: writeTest.insertedId});

  // Test indexes
  var indexCount = db.chat_rooms.getIndexes().length;
  healthCheck.checks.indexes = indexCount >= 3 ? "PASS" : "FAIL";

  // Check collection counts
  healthCheck.collections = {
    chat_rooms: db.chat_rooms.countDocuments(),
    messages: db.messages.countDocuments(),
    chat_members: db.chat_members.countDocuments(),
    user_presence: db.user_presence.countDocuments()
  };

  // Determine overall status
  var failedChecks = Object.values(healthCheck.checks).filter(status => status === "FAIL").length;
  healthCheck.status = failedChecks === 0 ? "HEALTHY" : (failedChecks <= 1 ? "DEGRADED" : "UNHEALTHY");

} catch (error) {
  healthCheck.status = "UNHEALTHY";
  healthCheck.error = error.toString();
}

// Output results
print(JSON.stringify(healthCheck, null, 2));