const fs = require('fs');
const { promisify } = require('util');

const pLimit = require('p-limit');
const puppeteer = require('puppeteer');
const papaparse = require('papaparse');
const { harFromMessages } = require('chrome-har');

// Prepare the tests
const proportion = 0.01;
const concurrency = 5;
const csv = fs.readFileSync('project/us-pages.csv', 'utf8'); // CSV file with the pages to test
// const csv = fs.readFileSync('project/eu-pages.csv', 'utf8'); // CSV file with the pages to test
const url =  'https://pubweb-landing-pages-production-br.pythian-int.com';

const csvData =  papaparse.parse(csv, { header: true }).data;
const homeRegex = /^\/[^/]*$/;
const routeRegex = /.*\/.\//;
const cityRegex = /^\/[^\/]+\/[^\/]+\/[^\/]*$/;
const limit = pLimit(concurrency);
const uris = csvData.map(row => row.uri);

// Generates the har files and the csv files for the scenarios

for (let i = 0; i < csvData.length; i++) {
  const uri = csvData[i].uri;
  console.log('Processing ' + uri);
  writeDestinationCsv(csvData, homeRegex, 'project/scenarios/home.csv');
  writeDestinationCsv(csvData, routeRegex, 'project/scenarios/route.csv');
  writeDestinationCsv(csvData, cityRegex, 'project/scenarios/city.csv');
};

console.log('Generating har files ');
const tasks = uris.map(uri => {
  return limit(() => generateHarFile(url + uri, 'project/har/' + uri.replaceAll('/', '_') + '.har'));
});

Promise.all(tasks)
  .then(() => console.log('All HAR files have been generated'))
  .catch((err) => console.error(err));

async function generateHarFile (url, path) {
  const events = [];

  const observe = [
    'Page.loadEventFired',
    'Page.domContentEventFired',
    'Page.frameStartedLoading',
    'Page.frameAttached',
    'Network.requestWillBeSent',
    'Network.requestServedFromCache',
    'Network.dataReceived',
    'Network.responseReceived',
    'Network.resourceChangedPriority',
    'Network.loadingFinished',
    'Network.loadingFailed',
  ];

      try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // register events listeners
    const client = await page.target().createCDPSession();
    await client.send('Page.enable');
    await client.send('Network.enable');
    observe.forEach(method => {
      client.on(method, params => {
        events.push({ method, params });
      });
    });

    // perform tests and retry in case of errors (e.g. timeout or network_changed errors)
    let loadError = null;
    do {
      try {
        await page.goto(url);
        loadError = null;
      } catch (e) {
        loadError = e;
      }
    } while (loadError);

    await browser.close();

    // convert events to HAR file
    const har = harFromMessages(events);
    await promisify(fs.writeFile)(path, JSON.stringify(har));
  } catch (err) {
    console.error(err);
  }
}

function writeDestinationCsv (data, regex, path) {
  const filteredData = data.filter(row => regex.test(row.uri));
  const newData = JSON.parse(
    JSON.stringify(filteredData).replaceAll('/', '_')
  );

  // Convert visits to integer and create new rows
  let expandedData = [];
  newData.forEach(row => {
    let visits = parseInt(row.visits);
    let rowsToAdd = Math.max(Math.round(visits * proportion), 1);
    for(let i = 0; i < rowsToAdd; i++) {
      expandedData.push(row);
    }
  });

  // Randomize the rows
  expandedData.sort(() => Math.random() - 0.5);

  const csv = papaparse.unparse(expandedData);
  fs.writeFileSync(path, csv);
}
