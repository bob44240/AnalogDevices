
const fs = require('fs');
const validator = require('validator');
const chalk = require('chalk');
const yargs = require('yargs');
const { parsed, string } = require('yargs');

var meanSeconds = 5;
var messageCount = 100;
var failureRate = .55;
var processId = 0;
var senderCount = 4;
var messagesSent = 0;
var abort =false;
var senders = [];

var start = Date.now();


function showElapsedTime() {
  var end = Date.now();
  var elapsed = end - start;
  var difference = new Date(elapsed);
  var diff_mins = difference.getMinutes();
  var diff_secs = difference.getSeconds();
  var diff_millisecs = difference.getMilliseconds();
  console.log(diff_mins + ':' + diff_secs + ':' + diff_millisecs)
}

var colors =['orange','red','blue', 'green', 'yellow','cyan'];


var successCount = 0;
var failureCount = 0;

yargs.version('1.1.1');

const http = require('http');
const { fork } = require('child_process');
const { send } = require('process');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { setupMaster } = require('cluster');
const port = 8000;
const host = 'localhost';

initialize();
const requestListener = function (req, res) {
  console.log("listening", req.url);
  if (abort) return;
  // Start system
  if (req.url === '/start') {
    setupMaster();
  }

  if (req.url === '/go') { execute(); }
}
const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});


function initialize() {
  meanSeconds = 2;
  messageCount = 100;
  failureRate = .25;
  processId = 0;
  senderCount = 4;
  messagesSent = 0;
  successCount = 0;
  failureCount = 0;
}
function setUp() {
    //Create senders /child processes
    for (var i = 0; i < senderCount; i++) {
      senders[i] = fork(__dirname + '/sender.js');
      console.log("Starting child process ", i)

      //Create handlers for messages from sender
      senders[i].on('message', (message) => {
        parts=message.split(':');     
        if (parts[0] === 'RESULT') {
          var senderId = Number(parts[1])
          if (parts[2] ==='OK') {
            successCount++;
          } else {
            failureCount++;
          }
          if (messageCount>0) {
            var msg = getMessage();
            sendMessage(senderId, 'SEND', msg);
          } else {
            // If we are out of messages kill process - maybe the whole thing? 
            console.log("Success: ", successCount, " Failures ", failureCount)
            showElapsedTime();
            senders[senderId].kill();
          }
        }
      })
    }

     for (var i = 0; i < senderCount; i++) {
        sendMessage(i, 'FAIL', failureRate);
        sendMessage(i, 'WAIT', meanSeconds);
     }
}

function execute() {
  //Start senders
  start = Date.now();
  for (var i = 0; i < senderCount; i++) {
    sendMessage(i, 'SEND', getMessage());
  }
}

function sendMessage(procId, type,message){
  var temp = type + ":" + procId + ":" + message;
  senders[procId].send(temp);
}

function getMessage() {
  console.log("Message Count ",messageCount)
  if (messageCount>0) {
    messageCount = messageCount-1;
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

//Yargs stuff
yargs.command ({
  command: 'setup',
  describe: 'Configure and start system',
  builder: {
    //messageCount=100
      messages: {
          describe: 'Number of random messages to generate',
          type: 'number',
          default: 100
      },
      //meanSeconds=2
      wait: {
          describe: 'Mean wait time in seconds',
          type: 'number',
          default: 2
      },
      //senderCount = 4;
      senders: {
          describe: 'Number of sender child processes',
          type: 'number',
          default: 4
      },
      //failureRate = .55;
      fail: {
          describe: 'Messsage failure rate in percent',
          type: 'number',
          default: 25
      },
      port: {
        describe: 'http port',
        type: 'number',
        default: 8000
    },
    control: {
      describe: "Control from browser",
      type: 'string',
      default: 'N'
    }
  },
  handler: function(arg) {

    //Setup all the params
      console.log(chalk.green("Message count", arg.messages));
      this.messageCount = arg.messages;
      if (arg.messages<10 || arg.messages>10000) {
        console.log(chalk.red("Invalid message count - Must be between 10 and 10,000"));
        this.abort = true;
      }

      console.log(chalk.green("Failure rate (%) ", arg.fail))
      if (arg.fail<0 || arg.fail>99) {
        console.log(chalk.red("Invalid failure rate - Must be between 10 and 90"));
        this.abort = true;
      }
      this.failureRate = arg.fail/100;

      console.log(chalk.green("Sender count", arg.senders));
      if (arg.senders<1 || arg.senders>10) {
        console.log(chalk.red("Invalid sender count - Must be between 1 and 10"));
        this.abort = true;
      }
      this.senderCount = arg.senders;

      console.log(chalk.green("Average wait time (seconds)", arg.wait));
      if (arg.wait<1 || arg.wait>10) {
        console.log(chalk.red("Invalid wait time - Must be between 1 and 50 seconds"));
        this.abort = true;
      }
      this.meanSeconds = arg.wait;

      console.log(chalk.green("Control from browser (Y/N)", arg.control));
      if (arg.control === 'Y'<1 || arg.control === 'N') {
        console.log(chalk.red("Invalid browser control - Must be Y or N"));
        this.abort = true;
      }

      if (abort) process.exit();
      if (arg.control === 'N') {
        setUp();
        execute()
      }
    }
})
yargs.parse()
