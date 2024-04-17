This folder contains pre-created k6 scenarios that will be used to load test the react frontend.

The tests are configured to:
- execute a nodejs script with puppeteer module to record a website access based on a csv file container URI and number of page views.
- execute a nodejs file to create k6 tests automated for every page on all the resources that a regular browser session would do.
- prepare a list of csv files for each type of the page, containing the test file name and proportionaly creating rows based on the number of page views.
- run k6 tests for the pages based on the csv files.

## Requirements

- docker must be installed in the vm.
- docker-compose must be installed in the vm.
  - A script for docker-compose install is inside the loadtest/scripts folder.
- the vm must have access to the url:
  -  'https://pubweb-landing-pages-production-br.pythian-int.com'
- the vm must have access to docker hub to download grafana/k6 and node:20 container images.
- 'country'-pages.csv file must be populated. An make target was created to download the file from cloud storage bucket, but the file can be download and saved localy. An example file was added to the repository.


## Usage

### retrieve-data-csv:
This target download a csv file from s3.
the target must be configured with the location of the `'country'-pages.csv` file  that will be used in the test.

This file must contain the headers: `uri` and `visits`.
An example file was added to the repo.

### generate-har-files:
This target runs puppeteer scripts to connect to all pages in the pages csv file and generate the HAR replay files.

This target also fills the specific pages csv files based on a regex validating the type of the pages and creating multiple entries proportionaly.

Everytime it runs it empties the files and recreate their content

The file puppeteer.js in the frontend folder must be adjusted in case the tests needs changes, the code below show the fields that might require attention:

```js
// Prepare the tests
const proportion = 0.1; //  the proportion of each url will be tested based on the number of page views
const csv = fs.readFileSync('project/us-pages.csv', 'utf8'); // CSV file with the pages to test
const url =  'https://pubweb-landing-pages-production-br.pythian-int.com'; // Base url for the test

// The regex below control the pages that goes on each type of file
const csvData =  papaparse.parse(csv, { header: true }).data;
const homeRegex = /^\/[^/]*$/;
const routeRegex = /.*\/.\//;
const cityRegex = /^\/[^\/]+\/[^\/]+\/[^\/]*$/;
```
### process-har-files
This target convert the har files to automated generated k6 tests per page based on all files located in the folder ./har

As all files are created based on their URI replacing "/" by "_" the files will always be overwitten in case of the base url is changed.

### setup-tests
This target runs both generate and process har file targets

### homepage-tests
Runs the tests base on the home.csv

### route-pages-tests
Runs the tests base on the route.csv

### city-pages-tests
Runs the tests base on the city.csv

## data.csv

This file must have the headers:
- `uri`
- `visits`

This file must not have empty lines as it will break k6 iterations.
