const chalk = require('chalk');
var meanWaitInMs = 5000;
var failureRate = .25;
var status = "IDLE";
var procId =-1;
var colors =['orange','red','blue', 'green', 'yellow','cyan'];

// function sleep(ms) {
//   return new Promise(
//     resolve => setTimeout(resolve, ms)
//   );
// }

function sendResult(message) {
  var result = 'OK';
  var percentFail = failureRate*100;
  fail = Math.random()*100;
  //console.log("Fail: ",fail,percentFail)
  if (fail<percentFail) {
    result = 'FAIL'
  }
  var temp = 'RESULT' + ':' + procId + ':' + result
  console.log(chalk.keyword(colors[procId])('Message sent',procId, result,message))
  //console.log(chalk "Message sent ", message, "was sent sender - result: ",temp)
  process.send(temp)
}

process.on('message', (message) => {
    //console.log('Child process received message', message);
    var parts = message.split(':');
    //console.log('Child process received message', parts[0], parts[1], parts[2]);
    procId = parts[1];
    switch (parts[0].toUpperCase()) {
      case 'FAIL':
        failureRate = Number(parts[2]);
        console.log("Failure rate set");
        break;

      case 'WAIT':
        meanWaitInMs = Number(parts[2])*1000;
        break;

        case 'SEND':
          //console.log("Sending ", status, parts[2], Date.now())
          if (status !== "IDLE") {
            console.log("Problem")
          } else {
            status = "SENDING"
            sleepOld(100);
            sendResult(parts[2]);
            //console.log("Sent ", parts[2], Date.now())
            status = "IDLE";
            break;
          }
         
        default:
          console.log('Message not recognized', procId);
    }

  });

  function sleepOld(ms) {
    const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < ms);
  }



