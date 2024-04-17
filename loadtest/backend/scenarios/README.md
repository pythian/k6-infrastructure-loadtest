This folder contains pre-created k6 scenarios that will be used to load test the search pool.

The tests are configured to:
- execute a POST request to the search service sending the search parameters.
- execute a GET request based on the post results to query the search service.
- retrieve the origin and destination values from a csv file.
- generate a random date for the aearch between 2-5 days in the future.

## Requirements

- docker must be installed in the vm. 
- docker-compose must be installed in the vm. 
  - A script for docker-compose install is inside the loadtest/scripts folder.
- the vm must have access to the url:
  -  https://poll-service-production-sa.pythian-int.com
- the vm must have access to docker hub to download grafana/k6 container image.
- data.csv file must be populated. An make target was created to download the file from cloud storage bucket, but the file can be download and saved localy. An example file was added to the repository.


## Usage

### retrieve-data-csv:
This target download a csv file from s3.
the target must be configured with the location of the `data.csv` file  that will be used in the test.

This file must contain the headers: `origin_city_id` and `destination_city_id`.
An example file was added to the repo.

### base-load-test:
Run the test using all the lines of the data.csv file.

This scenario is configured to use `10 virtual users` to execute the POST and GET requests.

A maximum execution time of `10 minutes` will be used and we  have a 1s sleep time between requests.

### stress-load-test:
Run the test using all the lines of the data.csv file.

This scenario is configured to use `1000 virtual users` to execute the POST and GET requests.

A maximum execution time of `10 minutes` will be used and we  have a 1s sleep time between requests.

### non-regular-load-test:
Run the test using a single line of the data.csv file.

This scenario is configured to use a non-regular traffic to simulate mustiple requests at the same time.

pre-configured scenario:
- ramp up from 0 to 50 users in 10 seconds
- keep 50 users for 1 minute
- ramp up to 300 users in 10 seconds
- ramp down to 50 users in 10 seconds
- keep 50 users for 1 minute
- ramp up to 300 users in 10 seconds
- ramp down to 50 users in 10 seconds
- ramp down to 0 users in 10 seconds

## data.csv

This file must have the headers:
- `origin_city_id`
- `destination_city_id`

This file must not have empty lines as it will break k6 iterations.
