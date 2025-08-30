build:
	docker build -t rinha-backend-2025-ts:latest .

run-containers:
	docker rm -f rinha-backend-2025-app-ts-1 rinha-backend-2025-nginx rinha-backend-2025-postgres && docker-compose up -d

run:
	make build && make run-containers
