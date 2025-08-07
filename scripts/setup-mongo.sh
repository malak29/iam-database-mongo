#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🍃 Setting up MongoDB for IAM Chat Service...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Create network if it doesn't exist
if ! docker network ls | grep -q iam-network; then
    echo -e "${BLUE}🌐 Creating iam-network...${NC}"
    docker network create iam-network
fi

# Start MongoDB
echo -e "${BLUE}🚀 Starting MongoDB...${NC}"
docker-compose up -d mongo

# Wait for MongoDB to be ready
echo -e "${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
until docker exec iam-mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    echo -e "${YELLOW}   Still waiting...${NC}"
    sleep 2
done

echo -e "${GREEN}✅ MongoDB is ready!${NC}"

# Run initialization scripts
echo -e "${BLUE}📝 Running initialization scripts...${NC}"

# Copy initialization scripts to container
docker cp ./init/ iam-mongo:/tmp/init/

# Execute initialization scripts
docker exec iam-mongo mongosh --eval "
  load('/tmp/init/01-create-database.js');
  load('/tmp/init/02-create-indexes.js');
  load('/tmp/init/03-seed-data.js');
  load('/tmp/init/04-create-functions.js');
  load('/tmp/init/05-create-views.js');
"

echo -e "${GREEN}✅ MongoDB setup completed!${NC}"

# Display connection information
echo -e "\n${BLUE}📋 Connection Information:${NC}"
echo -e "${YELLOW}┌─────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│ MongoDB Connection Details              │${NC}"
echo -e "${YELLOW}├─────────────────────────────────────────┤${NC}"
echo -e "${YELLOW}│${NC} Host: localhost:27017                ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} Database: iam_chat_db                ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} Admin User: iam_admin                ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} Chat User: iam_chat_user             ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} Web UI: http://localhost:8081        ${YELLOW}│${NC}"
echo -e "${YELLOW}└─────────────────────────────────────────┘${NC}"

echo -e "\n${GREEN}🎉 MongoDB setup successful!${NC}"
