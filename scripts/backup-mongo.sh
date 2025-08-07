#!/bin/bash

set -e

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}💾 Backing up MongoDB...${NC}"

# Create backup using mongodump
docker exec iam-mongo mongodump \
  --host localhost:27017 \
  --db iam_chat_db \
  --username iam_admin \
  --password IamAdmin123 \
  --authenticationDatabase admin \
  --out /tmp/backup

# Copy backup from container
docker cp iam-mongo:/tmp/backup/iam_chat_db "$BACKUP_DIR/"

# Create metadata file
cat > "$BACKUP_DIR/metadata.json" << EOF
{
  "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "database": "iam_chat_db",
  "version": "$(docker exec iam-mongo mongosh --quiet --eval 'db.version()')",
  "collections": $(docker exec iam-mongo mongosh iam_chat_db --quiet --eval 'JSON.stringify(db.getCollectionNames())')
}
EOF

# Create restore script
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
echo "🔄 Restoring MongoDB backup..."

docker exec iam-mongo mongorestore \
  --host localhost:27017 \
  --db iam_chat_db \
  --username iam_admin \
  --password IamAdmin123 \
  --authenticationDatabase admin \
  --drop \
  /tmp/restore/

echo "✅ MongoDB restore completed!"
EOF

chmod +x "$BACKUP_DIR/restore.sh"

echo -e "${GREEN}✅ Backup completed: $BACKUP_DIR${NC}"
