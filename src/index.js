const http = require("http");

const port = process.env.PORT || 3000;

function hello() {
  return "Hello World!";
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(hello());
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { hello };