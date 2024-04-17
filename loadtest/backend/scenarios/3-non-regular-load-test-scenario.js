/*
data.csv file must be replaced by the real data file on the server

- expected csv headers:
origin_city_id,destination_city_id
- csv must not contain empty lines
*/

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { scenario } from 'k6/execution';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

const baseURL = 'poll-service-production-br.pythian.com'
const postErrorRate = new Rate('post_errors');
const getErrorRate = new Rate('get_errors');
const postTrend = new Trend('post_response_time');
const getTrend = new Trend('get_response_time');

const csvData = new SharedArray('data', function () {
  return papaparse.parse(open('./data-v4.csv'), { header: true }).data;
});
const randomLine = Math.floor(Math.random() * csvData.length)

export const options = {
    scenarios: {
        'peak_test': {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
              { duration: '10s', target: 50 },
              { duration: '1m', target: 50 },
              { duration: '10s', target: 300 },
              { duration: '10s', target: 50 },
              { duration: '1m', target: 50 },
              { duration: '10s', target: 300 },
              { duration: '10s', target: 50 },
            ],
            gracefulRampDown: '10s',
        },
    },
    thresholds: {
        get_errors: ['rate<0.01'], // < 1%
        post_errors: ['rate<0.01'], // < 1%
        get_response_time : ['p(95)<2000'], // < 2s
        post_response_time : ['p(95)<500'], // < 500ms
    },
};

export default function () {
    const urlGet = `https://${baseURL}`;
    const urlPost = `https://${baseURL}/searches`;
    const params = {
        headers: {
            'accept': 'application/vnd.pythian+json; version=3; profile=https://schema.pythian.com/v3/anything.json',
            'Accept-Encoding': Math.random() > 0.68 ? 'gzip' : 'br',
            'Content-Type': 'application/json',
        }
    };

    var futureDate = new Date((Date.now() + 1 * 24 * 60 * 60 * 1000) + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000);
    var date = futureDate.toISOString().split('T')[0];

    const postData = JSON.stringify({
        legs: [
            {
                origin: {
                    type: "city",
                    id: csvData[randomLine].origin_city_id
                },
                destination: {
                    type: "city",
                    id: csvData[randomLine].destination_city_id
                },
                date: date
            }
        ],
        passengers: [
            {
                category: "adult",
                wheelchair: false,
                discounts: []
            }
        ],
        options: {
            lang: "en-US",
            locale: "en-us",
            currency: "USD",
            include_sold_out: false,
            include_states: ["active"],
            supported_payment_providers: []
        }
    });

    var postRequest = {
        'post': {
            'url': urlPost,
            'body': postData,
            'params': params,
        },
    };

    const postResp  = http.post(postRequest.post.url, postRequest.post.body, postRequest.post.params);

    var additionalQueryParams = '&format=related'
    var getRequest = {
        'get': {
            'url': `${urlGet}${postResp.json().metadata.links.poll_next_leg}${additionalQueryParams}`,
            'params': params,
        },
    };

    const getResp = http.get(getRequest.get.url, getRequest.get.params);

    check(postResp, {
        'status is 201': (r) => r.status === 201
    }) || postErrorRate.add(1);

    postTrend.add(postResp.timings.duration);

    check(getResp, {
        'status is 200': (r) => r.status === 200
    }) || getErrorRate.add(1);

    getTrend.add(getResp.timings.duration);

    sleep(1);
}
