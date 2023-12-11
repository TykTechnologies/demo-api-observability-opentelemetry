import http from 'k6/http';
import { sleep } from 'k6';

var testDuraction = '15m';

const params = {
  headers: { 'Content-Type': 'application/json', 'x-tyk-authorization': '28d220fd77974a4facfb07dc1e49c2aa', 'Response-Type': 'application/json' },
  responseType: 'text'
};

// 4 users with different API calls, all successfull
// 1 user with rate-limiting issue
// 1 user doesn't have permission for API version 2
// 1 user with lots of 404 errors

export function setup() {

  var alias1 = "mobile-app";
  var alias2 = "website";
  var alias3 = "screen-app";
  var alias4 = "trial-rate-limited";

  var users = [];

  var data = '{"alias": "' + alias1 
      + '", "expires": -1, "access_rights": { '
      + ' "1": { "api_id": "1", "api_name": "flight information","versions": ["Default"]},'
      + ' "2": { "api_id": "2", "api_name": "baggage tracking","versions": ["Default"]},'
      + ' "3": { "api_id": "3", "api_name": "parking reservation","versions": ["Default"]}'
    + '}}' ;

  let res = http.post("http://host.docker.internal:8080/tyk/keys/create", data, params);

  var authKey1 = res.json().key;
  users[0] = [alias1, authKey1];

  var data2 = '{"alias": "' + alias2 
      + '", "expires": -1, "access_rights": { '
      + ' "1": { "api_id": "1", "api_name": "flight information","versions": ["Default"]},'
      + ' "2": { "api_id": "2", "api_name": "baggage tracking","versions": ["Default"]},'
      + ' "3": { "api_id": "3", "api_name": "parking reservation","versions": ["Default"]}'
    + '}}' ;

  res = http.post("http://host.docker.internal:8080/tyk/keys/create", data2, params);

  var authKey2 = res.json().key;
  users[1] = [alias2, authKey2];

  var data3 = '{"alias": "' + alias3 
      + '", "expires": -1, "access_rights": { '
      + ' "1": { "api_id": "1", "api_name": "flight information","versions": ["Default"]},'
      + ' "2": { "api_id": "2", "api_name": "baggage tracking","versions": ["Default"]},'
      + ' "3": { "api_id": "3", "api_name": "parking reservation","versions": ["Default"]}'
    + '}}' ;

  res = http.post("http://host.docker.internal:8080/tyk/keys/create", data3, params);

  var authKey3 = res.json().key;
  users[2] = [alias3, authKey3];


  var data4 = '{"alias": "' + alias4 
      + '", "expires": -1, "access_rights": { '
      + ' "1": { "api_id": "1", "api_name": "flight information","versions": ["Default"]},'
      + ' "2": { "api_id": "2", "api_name": "baggage tracking","versions": ["Default"]},'
      + ' "3": { "api_id": "3", "api_name": "parking reservation","versions": ["Default"]}'
    + '}}' ;

  res = http.post("http://host.docker.internal:8080/tyk/keys/create", data4, params);

  var authKey4 = res.json().key;
  users[3] = [alias4, authKey4];
  


  return { users };
}


export const options = {
  discardResponseBodies: false,
  scenarios: {
    user_102: {
      executor: 'constant-arrival-rate',
      exec: 'user_102',
      rate: 2,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: testDuraction,
      preAllocatedVUs: 1, // how large the initial pool of VUs would be
      maxVUs: 1, // if the preAllocatedVUs are not enough, we can initialize more
    },
    user_104: {
      executor: 'constant-arrival-rate',
      exec: 'user_104',
      rate: 3,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: testDuraction,
      preAllocatedVUs: 1, // how large the initial pool of VUs would be
      maxVUs: 1, // if the preAllocatedVUs are not enough, we can initialize more
    },
    user_105: {
      executor: 'constant-arrival-rate',
      exec: 'user_105',
      rate: 1,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: testDuraction,
      preAllocatedVUs: 1, // how large the initial pool of VUs would be
      maxVUs: 1, // if the preAllocatedVUs are not enough, we can initialize more
    },
    user_trial_rate_limited: {
      executor: 'constant-arrival-rate',
      exec: 'user_106',
      rate: 1,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: testDuraction,
      preAllocatedVUs: 1, // how large the initial pool of VUs would be
      maxVUs: 1, // if the preAllocatedVUs are not enough, we can initialize more
    }

  }
}

export default function (data) {
  //console.log("default function: " + JSON.stringify(data.authKey));
}

export function user_102(data) {

  const params = {
    headers: { 'authorization': data.users[0][1] }
  };

  http.get('http://host.docker.internal:8080/baggage-tracking/get', params);
  http.get('http://host.docker.internal:8080/flight-information/get', params);
  http.get('http://host.docker.internal:8080/parking-reservation/check-availability/', params);

}

export function user_104(data) {

  const params = {
    headers: { 'authorization': data.users[1][1] }
  };

  http.get('http://host.docker.internal:8080/baggage-tracking/get', params);
  http.get('http://host.docker.internal:8080/flight-information/get', params);
  http.get('http://host.docker.internal:8080/parking-reservation/get', params);

}


export function user_105(data) {

  const params = {
    headers: { 'authorization': data.users[2][1] }
  };

  http.get('http://host.docker.internal:8080/baggage-tracking/status/500', params);
  http.get('http://host.docker.internal:8080/flight-information/status/500', params);
  http.get('http://host.docker.internal:8080/parking-reservation/get', params);

}


export function user_106(data) {

  const params = {
    headers: { 'authorization': data.users[3][1] }
  };

  http.get('http://host.docker.internal:8080/baggage-tracking/status/500', params);
  http.get('http://host.docker.internal:8080/flight-information/status/500', params);
  http.get('http://host.docker.internal:8080/parking-reservation/get', params);

}

