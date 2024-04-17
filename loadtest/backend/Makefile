BUCKET="pythian-k6-scenario-data"

install-docker-compose:
	@echo 'Installing docker-compose'
	chmod +x scripts/install_docker_compose.sh && ./scripts/install_docker_compose.sh

retrieve-data-csv:
	@echo 'Download data from storage bucket into local data.csv'
	gsutil cp gs://${BUCKET}/origin-destination-list-v4.csv ./scenarios/data-v4.csv
	gsutil cp gs://${BUCKET}/origin-destination-list-EU-v4.csv ./scenarios/data-EU-v4.csv
	gsutil cp gs://${BUCKET}/origin-destination-list-NA-v4.csv ./scenarios/data-NA-v4.csv
	gsutil cp gs://${BUCKET}/origin-destination-list-SA-v4.csv ./scenarios/data-SA-v4.csv
	gsutil cp gs://${BUCKET}/high-trip-count-EU.csv ./scenarios/high-trip-count-EU.csv

base-load-test:
	@echo 'Running Base Load Test Scenario'
	docker compose run --rm k6 run /scripts/1-base-load-test-scenario.js

stress-load-test:
	@echo 'Running Stress Load Test Scenario'
	docker compose run --rm k6 run /scripts/2-stress-load-test-scenario.js

non-regular-load-test:
	@echo 'Running Stress Load Test Scenario'
	docker compose run --rm k6 run /scripts/3-non-regular-load-test-scenario.js
