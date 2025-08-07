.PHONY: help start stop reset backup restore stats clean setup

help: ## Show this help message
	@echo "IAM MongoDB Management"
	@echo "====================="
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

setup: ## Setup MongoDB with initialization scripts
	@./scripts/setup-mongo.sh

start: ## Start MongoDB container
	@docker-compose up -d mongo mongo-express
	@echo "🍃 MongoDB started on localhost:27017"
	@echo "🌐 Mongo Express UI: http://localhost:8081"

stop: ## Stop MongoDB containers
	@docker-compose down

reset: ## Reset MongoDB data (WARNING: Deletes all data)
	@./scripts/reset-mongo.sh

backup: ## Backup MongoDB data
	@./scripts/backup-mongo.sh

stats: ## Show MongoDB statistics
	@./scripts/mongo-stats.sh

clean: ## Clean up all data and containers
	@docker-compose down -v
	@docker volume prune -f
	@echo "🧹 MongoDB data cleaned"

logs: ## Show MongoDB logs
	@docker-compose logs -f mongo

replica: ## Setup replica set for production
	@docker-compose up -d mongo-primary mongo-secondary1 mongo-secondary2
	@sleep 10
	@docker exec iam-mongo-primary mongosh --eval "load('/docker-entrypoint-initdb.d/replica-set.js')"
	@echo "✅ Replica set configured"