build:
	docker build -t rinha-backend-2025-ts:latest .

run-build:
	make build && docker rm -f rinha-backend-2025-app-ts && docker-compose up -d