
const fs = require('fs');
const validator = require('validator');
const chalk = require('chalk');
const yargs = require('yargs');
const { parsed } = require('yargs');

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
const port = 8000;
const host = 'localhost';

function initilize() {
  meanSeconds = 1000;
  messageCount = 100;
  failureRate = .55;
  processId = 0;
  senderCount = 4;
  messagesSent = 0;
  successCount = 0;
  failureCount = 0;
}
const requestListener = function (req, res) {
  console.log("listening", req.url);
  if (abort) return;
  // Start system
  if (req.url === '/start') {
    console.log('Start command recvd')
    
    initilize();

    //Create senders
    for (var i = 0; i < senderCount; i++) {

      //Crate child process
      senders[i] = fork(__dirname + '/sender.js');
      console.log("Starting child process ", i)

      //Create handlers for messages from sender
      senders[i].on('message', (message) => {
        //console.log('Message:', message);   
        parts=message.split(':');     
        if (parts[0] === 'RESULT') {
          //If messageCount>0 send next message else kill process
          var senderId = Number(parts[1])
          //console.log('Result recvd from sender ', senderId);   
          if (parts[2] ==='OK') {
            successCount++;
          } else {
            failureCount++;
          }
          
          if (messageCount>0) {
            var msg = getMessage();
            sendMessage(senderId, 'SEND', msg);
          } else {
            //Kill sender process
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

  if (req.url === '/go') {
    //Start senders
    start = Date.now();
    for (var i = 0; i < senderCount; i++) {
      sendMessage(i, 'SEND', getMessage());
   }
  }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

function sendMessage(procId, type,message){
  var temp = type + ":" + procId + ":" + message;
  //console.log("Send message ",procId,type,message)
  
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
  //console.log("Rand string ",length, result);
  return result;
}

//Yargs stuff
yargs.command ({
  command: 'setup',
  describe: 'Configure and start system',
  builder: {
      messages: {
          describe: 'Number of random messages to generate',
          type: 'number',
          default: 1000
      },
      wait: {
          describe: 'Mean wait time in seconds',
          type: 'number',
          default: 5
      },
      senders: {
          describe: 'Number of sender child processes',
          type: 'number',
          default: 5
      },
      fail: {
          describe: 'Messsage failure rate in percent',
          type: 'number',
          default: 75
      },
      port: {
        describe: 'http port',
        type: 'number',
        default: 8000
    }
  },
  handler: function(arg) {
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

  }
})

yargs.parse()
