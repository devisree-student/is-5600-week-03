// Import required modules
const express = require('express');
const path = require('path');
const EventEmitter = require('events');
const url = require('url');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Create an EventEmitter for broadcasting chat messages
const chatEmitter = new EventEmitter();

// Serve static files from the 'public' folder (chat.js, chat.css, etc.)
app.use(express.static(__dirname + '/public'));

// Serve the chat.html file
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

// Respond with plain text ("/" route)
function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

// Respond with JSON ("/json" route)
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// Respond with the input string in various formats ("/echo" route)
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Respond with a 404 error (for invalid routes)
function respondNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

// Respond to chat messages and emit them to all connected clients ("/chat" route)
function respondChat(req, res) {
  const { message } = req.query;

  // Emit the message to all connected clients
  chatEmitter.emit('message', message);
  res.end();
}

// Respond to server-sent events (SSE) for chat messages ("/sse" route)
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  // Clean up when the client disconnects
  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// Register routes
app.get('/', chatApp);  // Serve chat app HTML
app.get('/json', respondJson);  // JSON response
app.get('/echo', respondEcho);  // Echo route
app.get('/chat', respondChat);  // Chat messages
app.get('/sse', respondSSE);  // SSE for live chat

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
