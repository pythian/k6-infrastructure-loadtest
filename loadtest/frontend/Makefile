BUCKET="pythian-k6-scenario-data"

.PHONY: install-docker-compose
install-docker-compose:
	@echo 'Installing docker-compose'
	chmod +x scripts/install_docker_compose.sh && ./scripts/install_docker_compose.sh

.PHONY: retrieve-data-csv
retrieve-data-csv:
	@echo 'Download data from storage bucket into local data.csv'
	gsutil cp gs://${BUCKET}/pubweb-eu-top-500.csv ./eu-pages.csv
	gsutil cp gs://${BUCKET}/pubweb-na-top-500.csv ./us-pages.csv


.PHONY: convert-har-to-k6
convert-har-to-k6:
	@echo 'Converting HAR files to K6 scripts'
	@npm install -g --save har-to-k6
	for file in ./har/*; do \
		har-to-k6 $$file -o ./scenarios/tests/`basename $$file .har`.js; \
	done

.PHONY: generate-har-files
generate-har-files:
	@echo 'Generating HAR files'
	docker compose run -i --rm puppeteer node -e "$$(cat ./puppeteer.js)"

.PHONY: process-har-files
process-har-files:
	@echo 'Processing HAR files'
	docker compose run -i --rm har-to-k6

.PHONY: setup-tests
setup-tests: generate-har-files process-har-files

.PHONY: homepage-tests
homepage-tests:
	@echo 'Running homepage tests'
	docker compose run --rm k6-frontend node /scripts/project/home.js;

.PHONY: route-pages-tests
route-pages-tests:
	@echo 'Running route pages tests'
	docker compose run --rm k6-frontend node /scripts/project/route.js;

.PHONY: city-pages-tests
city-pages-tests:
	@echo 'Running city pages tests'
	docker compose run --rm k6-frontend node /scripts/project/city.js;
