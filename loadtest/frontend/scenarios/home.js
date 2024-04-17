const fs = require('fs');
const csv = require('csv-parser');
const { execSync } = require('child_process');

fs.createReadStream('/scripts/project/home.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log('Running k6 test for: ', row.uri);
    execSync(`k6 run --vus 300 --duration 10s /scripts/project/tests/${row.uri}.js`, {stdio: 'inherit'});
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
