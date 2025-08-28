build:
	docker build -t rinha-backend-2025-ts:latest .

run-containers:
	docker rm -f rinha-backend-2025-app-ts-1 rinha-backend-2025-app-ts-2 rinha-backend-2025-nginx && docker-compose up -d

run-build:
	make build && make run-containers