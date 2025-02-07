docker-watch:
	docker compose -f compose.development.yml up --build --watch

docker-test:
	docker compose -f compose.development.yml up -d --build
	docker compose -f compose.development.yml exec api npm run test