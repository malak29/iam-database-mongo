#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 MongoDB Health Check${NC}"

# Check if container is running
if ! docker ps | grep -q iam-mongo; then
    echo -e "${RED}❌ MongoDB container is not running${NC}"
    exit 1
fi

# Run health check script
health_result=$(docker exec iam-mongo mongosh iam_chat_db --quiet --eval "$(cat ./health/mongo-healthcheck.js)")

# Parse results
status=$(echo "$health_result" | jq -r '.status')
timestamp=$(echo "$health_result" | jq -r '.timestamp')

echo -e "\n${BLUE}📋 Health Check Results (${timestamp}):${NC}"
echo -e "${YELLOW}┌─────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│ MongoDB Health Status                   │${NC}"
echo -e "${YELLOW}├─────────────────────────────────────────┤${NC}"

case $status in
  "HEALTHY")
    echo -e "${YELLOW}│${NC} Overall Status: ${GREEN}✅ HEALTHY${NC}          ${YELLOW}│${NC}"
    ;;
  "DEGRADED")
    echo -e "${YELLOW}│${NC} Overall Status: ${YELLOW}⚠️  DEGRADED${NC}        ${YELLOW}│${NC}"
    ;;
  "UNHEALTHY")
    echo -e "${YELLOW}│${NC} Overall Status: ${RED}❌ UNHEALTHY${NC}        ${YELLOW}│${NC}"
    ;;
  *)
    echo -e "${YELLOW}│${NC} Overall Status: ${RED}❌ UNKNOWN${NC}          ${YELLOW}│${NC}"
    ;;
esac

echo -e "${YELLOW}├─────────────────────────────────────────┤${NC}"

# Display individual checks
checks=$(echo "$health_result" | jq -r '.checks')
for check in ping auth read write indexes; do
    result=$(echo "$checks" | jq -r ".$check")
    if [ "$result" == "PASS" ]; then
        echo -e "${YELLOW}│${NC} $check: ${GREEN}✅ PASS${NC}                     ${YELLOW}│${NC}"
    else
        echo -e "${YELLOW}│${NC} $check: ${RED}❌ FAIL${NC}                     ${YELLOW}│${NC}"
    fi
done

echo -e "${YELLOW}├─────────────────────────────────────────┤${NC}"

# Display collection counts
collections=$(echo "$health_result" | jq -r '.collections')
chat_rooms=$(echo "$collections" | jq -r '.chat_rooms')
messages=$(echo "$collections" | jq -r '.messages')
members=$(echo "$collections" | jq -r '.chat_members')
presence=$(echo "$collections" | jq -r '.user_presence')

echo -e "${YELLOW}│${NC} Chat Rooms: $chat_rooms                    ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} Messages: $messages                      ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} Members: $members                       ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC} Presence Records: $presence              ${YELLOW}│${NC}"
echo -e "${YELLOW}└─────────────────────────────────────────┘${NC}"

# Exit with appropriate code
case $status in
  "HEALTHY") exit 0 ;;
  "DEGRADED") exit 1 ;;
  "UNHEALTHY") exit 2 ;;
  *) exit 3 ;;
esac
