const fs = require('fs');
const validator = require('validator');
const chalk = require('chalk');
const yargs = require('yargs');
const { parsed } = require('yargs');
const child= require ("child_process")
yargs.version('1.1.1');
//fs.writeFileSync('notes.txt', "My name is Bob");
//fs.appendFileSync('notes.txt', "\n A third line");

// result = validator.isEmail("fred");
// console.log(result);

// console.log(chalk.blue('Hello Blue'));

// console.log(chalk.green('Hello Green'));

// console.log(process.argv);

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

//const bookJSON = JSON.stringify(testBook);
//const parseData = JSON.parse(bookJSON);

//console.log(bookJSON, parseData);


//console.log(yargs.argv)