# IAM MongoDB Configuration

MongoDB database configuration for the IAM Chat Service, providing real-time messaging capabilities.

## 🏗️ Architecture

### Collections
- **chat_rooms** - Chat rooms/channels with metadata
- **messages** - Chat messages with threading support
- **chat_members** - User membership in chat rooms
- **user_presence** - Real-time user presence status

### Features
- 📱 **Real-time messaging** with WebSocket
- 🔍 **Full-text search** in messages and rooms
- 💬 **Message threading** and replies
- 😊 **Emoji reactions** on messages
- 👥 **User presence** tracking
- 📊 **Message history** with pagination
- 🏢 **Organization/Department** scoping

## 🚀 Quick Start

```bash
# Setup MongoDB
make setup

# Start MongoDB
make start

# Check health
make stats

# Access Mongo Express UI
open http://localhost:8081
```

## 🔧 Configuration

### Development
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://iam_chat_user:ChatUser123@localhost:27017/iam_chat_db
```

### Production (Replica Set)
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://user:pass@mongo1:27017,mongo2:27017,mongo3:27017/iam_chat_db?replicaSet=iam-rs
```

## 📊 Monitoring

- **Mongo Express**: http://localhost:8081 (admin/admin123)
- **Prometheus Metrics**: http://localhost:9216/metrics
- **Grafana Dashboard**: http://localhost:3001 (admin/admin123)

## 🔒 Security

- Authentication enabled by default
- Separate user for chat service
- Schema validation on all collections
- Audit logging for data changes