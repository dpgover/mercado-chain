// Lets require/import the HTTP module
const http = require('http');

// Lets define a port we want to listen to
const PORT = 8181;

// We need a function which handles requests and send response
function handleRequest(request, response){
  response.end('This is a dummy server');
}

// Create a server
const server = http.createServer(handleRequest);

// Lets start our server
server.listen(PORT, () => {
  // Callback triggered when server is successfully listening. Hurray!
  console.log('Server listening on: http://localhost:%s', PORT);
});
