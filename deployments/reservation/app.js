/*app.js*/

const express = require('express');
const http = require('http');

const PORT = parseInt(process.env.PORT || '8091');
const app = express();

const options = {
  hostname: 'host.docker.internal', // Replace with the URL you want to send a GET request to
  port: 8081, 
  path: '/delay/3', // Replace with the path to the resource you want to retrieve
  method: 'GET', // HTTP method
};

// dummy service

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/check-availability', (req, res) => {
  const upstreamReq = http.request(options, (upStreamRes) => {
    let data = '';

    // A chunk of data has been received.
    upStreamRes.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    upStreamRes.on('end', () => {
      console.log(data);
      res.send(getRandomNumber(1, 6).toString());
    });
  });

  upstreamReq.on('error', (err) => {
    console.error(err);
    res.status(500).send('An error occurred while making the request.');
  });

  upstreamReq.end(); // Don't forget to end the request.
});


app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
