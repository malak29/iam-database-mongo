!/bin/bash

set -e

echo -e "${RED}⚠️  This will DELETE ALL chat data!${NC}"
read -p "Are you sure? Type 'RESET' to confirm: " confirm

if [ "$confirm" != "RESET" ]; then
    echo -e "${YELLOW}❌ Reset cancelled${NC}"
    exit 0
fi

echo -e "${BLUE}🗑️  Resetting MongoDB...${NC}"

# Drop database
docker exec iam-mongo mongosh iam_chat_db --eval "db.dropDatabase()"

# Re-run initialization
docker cp ./init/ iam-mongo:/tmp/init/
docker exec iam-mongo mongosh --eval "
  load('/tmp/init/01-create-database.js');
  load('/tmp/init/02-create-indexes.js'); 
  load('/tmp/init/03-seed-data.js');
  load('/tmp/init/04-create-functions.js');
  load('/tmp/init/05-create-views.js');
"

echo -e "${GREEN}✅ MongoDB reset completed!${NC}"
