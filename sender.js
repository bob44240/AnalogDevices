const chalk = require('chalk');
var meanWaitInMs = 5000;
var failureRate = .25;
var status = "IDLE";
var procId =-1;
var colors =['orange','red','blue', 'green', 'yellow','cyan'];

function sendResult(message) {
  var result = 'OK';
  var percentFail = failureRate*100;
  fail = Math.random()*100;
  if (fail<percentFail) {
    result = 'FAIL'
  }
  var temp = 'RESULT' + ':' + procId + ':' + result
  console.log(chalk.keyword(colors[procId])('Message sent',procId, result,message))
  process.send(temp)
}

process.on('message', (message) => {
    var parts = message.split(':');
    procId = parts[1];
    switch (parts[0].toUpperCase()) {
      case 'FAIL':
        failureRate = Number(parts[2]);
        console.log("Failure rate set");
        break;

      case 'WAIT':
        meanWaitInMs = Number(parts[2])*1000;
        console.log("Setting mean wait time ", meanWaitInMs);
        break;

        //Request to send a message
        case 'SEND':
          if (status !== "IDLE") {
            console.log("Problem")
          } else {
            status = "SENDING"
            sleep(getRandomDelayAroundSpecifiedMean());
            sendResult(parts[2]);
            status = "IDLE";
            break;
          }
         
        default:
          console.log("sender.js error - Shoudn't get here", procId);
    }
  });

  function getRandomDelayAroundSpecifiedMean(){
    var randomPart = Math.random()*meanWaitInMs;
    var msDelay=meanWaitInMs;
    var add = Math.random();
    if (add>.5) {
      msDelay+=randomPart;
    }else {
      msDelay-=randomPart;
    }
    return msDelay;
  }

  function sleep(ms) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < ms);
  }

  //Why doesn't this work?
  // function sleep(ms) {
//   return new Promise(
//     resolve => setTimeout(resolve, ms)
//   );
// }



