const fs = require('fs');
const validator = require('validator');
const chalk = require('chalk');

//fs.writeFileSync('notes.txt', "My name is Bob");
fs.appendFileSync('notes.txt', "\n A third line");

result = validator.isEmail("fred");
console.log(result);

console.log(chalk.blue('Hello Blue'));


