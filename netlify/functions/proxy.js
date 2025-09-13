const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const url = 'https://script.google.com/macros/s/AKfycbwVPS2tPS3HXgeLQAGNlJlLv9Qy9v70u2C4O-pgMS0GEG-OX1Wd1CmqqNgrKh6J6QTaQg/exec';

  // Forward method, headers, and body
  const response = await fetch(url, {
    method: event.httpMethod,
    headers: { 'Content-Type': 'application/json' },
    body: event.body
  });

  const data = await response.text();

  return {
    statusCode: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: data
  };
};