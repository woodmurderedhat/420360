// Netlify Function proxy to forward requests to Google Apps Script and add CORS headers.
// Replace TARGET with your Apps Script URL if it changes.
const TARGET = 'https://script.google.com/macros/s/AKfycbwVPS2tPS3HXgeLQAGNlJlLv9Qy9v70u2C4O-pgMS0GEG-OX1Wd1CmqqNgrKh6J6QTaQg/exec';

exports.handler = async function(event, context) {
  // Handle CORS preflight. Allow configuring allowed origin via env var CORS_ORIGIN.
  const ORIGIN = process.env.CORS_ORIGIN || '*';
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  try {
    // Preserve query string if present
    const qs = event.rawQueryString ? `?${event.rawQueryString}` : '';
    const url = TARGET + qs;

    // Build fetch options
    const fetchOptions = {
      method: event.httpMethod,
      headers: {},
    };

    // Forward content-type if provided
    if (event.headers && event.headers['content-type']) {
      fetchOptions.headers['content-type'] = event.headers['content-type'];
    }

    if (event.body && event.httpMethod !== 'GET') {
      fetchOptions.body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    }

    // Use the global fetch available in Netlify runtime
    const response = await fetch(url, fetchOptions);
    const body = await response.text();

    // Forward content-type from target if available
    const contentType = response.headers.get('content-type') || 'text/plain';

    return {
      statusCode: response.status,
      headers: Object.assign({}, CORS_HEADERS, { 'Content-Type': contentType }),
      body
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: 'Proxy error: ' + String(err)
    };
  }
};
