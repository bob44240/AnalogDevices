
const fs = require('fs');
const validator = require('validator');
const chalk = require('chalk');
const yargs = require('yargs');
const { parsed } = require('yargs');

var meanSeconds = 1000;
var messageCount = 1000;
var failureRate = .25;
var processId = 0;
var senderCount = 5;
var messagesSent = 0;

yargs.version('1.1.1');

const http = require('http');
const { fork } = require('child_process');
const port = 8000;
const host = 'localhost';

const requestListener = function (req, res) {
  console.log("listening", req.url);
  
  // Start system
  if (req.url === '/start') {
    var senders = [];
    initilize();

    //Create senders
    for (var i = 0; i < senderCount; i++) {

      //Crate child process
      senders[i] = fork(__dirname + '/getCount');
      console.log("Starting child process ", i)

      //Create handlers for messages from sender
      senders[i].on('message', (message) => {
        console.log('Message recvd from sender ', i, '  Message:', message);
        if (message === 'GetNextMessage') {
          if (getNextMessage) {}
        }
        senders[i].send('S' + getMessage() );
      });
        // res.setHeader('Content-Type', 'application/json');
        // res.writeHead(200);
        // res.end(message);
    }
  } else if (req.url === '/hello') {
    console.log('Returning /hello results');
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(`{"message":"hello"}`);
  }
};

const server = http.createServer(requestListener);

function initilize() {
  meanSeconds = 1000;
  messageCount = 1000;
  failureRate = .25;
  processId = 0;
  senderCount = 5;
  messagesSent = 0;
}
function getMessage() {
  if (this.messageCount>0) {
    this.messageCount--;
    return randomString();
  } else {
    return "";
  }
}

function randomString() {
  var length = Math.floor(Math.random() * 100) + 1;
  var chars =  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}



// console.log("starting");
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

yargs.command ({
  command: 'add',
  describe: 'Add a new note',
  builder: {
      title: {
          describe: 'Title of the note',
          demandOption: true, //Title required
          type: 'string'
      },
      body: {
          describe: 'Body of the note',
          demandOption: true,
          type: 'string'
      }
  },
  handler: function(arg) {
      console.log(chalk.red("Title is", arg.title))
      console.log(chalk.green("body is", arg.body))
  }
})

yargs.parse()

const testBook = {
  title: 'Last piece',
  author: 'fred brown'
}

const bookJSON = JSON.stringify(testBook);
const parseData = JSON.parse(bookJSON);

console.log(bookJSON, parseData);


buildRandomStrings(size) {

  for (var i=0, )


}