import { handleOperation } from "./operationHandler.js";
import inquirer from 'inquirer';
import fs from 'fs';
import chalk from 'chalk';
import { fetchWebsiteContent } from './fetchUrl.js';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { encodedPrompts as prompts } from "./prompts.js";
import { exec } from 'child_process';
import process from 'process';
import parseDiff from 'parse-diff';
import ora from 'ora';

const { translateText, generateCode } = prompts;
const options = { inputMethods: ['File', 'Text'], };
let popularLanguages = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Swift', 'Go', 'Kotlin'];

const decodePrompt = (prompt) => {
  return Buffer.from(prompt, 'base64').toString('ascii');
}

export const selectInputMethod = async (selectedOperation) => {
  try {
    let inputText = '';
    let fileQuestion = '';
    let operation = '';

    if (selectedOperation === 'Ask PDF') {
      inputText = await readFileAsPdf();
      operation = await askOperation();
    } else if (selectedOperation === 'Ask URL') {
      inputText = await fetchContentFromUrl();
      operation = await askOperation();
    } else if (selectedOperation === 'Generate Git Message') {
      inputText = await fetchGitDiff();
    } else {
      let method = await selectInput();

      if (method === 'File') {
        inputText = await readFromFile(selectedOperation);
        if (selectedOperation === 'Ask a question') {
          fileQuestion = await askQuestion();
        }
      } else if (method === 'Text') {
        inputText = await readFromTextInput();
      }

      if (selectedOperation === 'Translate text') {
        inputText = await translateUserText(inputText);
      } else if (selectedOperation === 'Generate code') {
        inputText = await generateUserCode(inputText);
      }
    }

    inputText += operation ? `\n${operation}` : '';
    await handleOperation(inputText, selectedOperation, fileQuestion);
  } catch (err) {
    console.error(chalk.red(`An error occurred: ${err}`));
  }
};

async function readFileAsPdf() {
  const { filePath } = await inquirer.prompt([
    { type: 'input', name: 'filePath', message: 'Enter file path:', },
  ]);
  let dataBuffer = fs.readFileSync(filePath);
  let pdfData = await pdf(dataBuffer);
  console.log(chalk.green('\nSuccessfully read file.'));
  return pdfData.text;
}

async function fetchContentFromUrl() {
  const { url } = await inquirer.prompt([
    { type: 'input', name: 'url', message: 'Enter URL:', },
  ]);
  const newS = ora('Getting URL Data...').start();
  const websiteData = await fetchWebsiteContent(url);
  console.log(chalk.green('\nSuccessfully read URL.'));
  newS.succeed();
  return JSON.stringify(websiteData);
}

function fetchGitDiff() {
  return new Promise((resolve, reject) => {
    exec('git diff', { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) {
        reject('Error loading git diff.');
      } else {
        console.log(chalk.green('\nSuccessfully read git diff.'));
        resolve(JSON.stringify(parseDiff(stdout)));
      }
    });
  });
}

async function selectInput() {
  const { method } = await inquirer.prompt([
    { type: 'list', name: 'method', message: 'Choose input method:', choices: options.inputMethods, },
  ]);
  return method;
}

function readFromFile(selectedOperation) {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
      { type: 'input', name: 'filePath', message: 'Enter file path:', },
    ]).then(({ filePath }) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject('Error reading file.');
        } else {
          console.log(chalk.green('\nSuccessfully read file.'));
          resolve(data);
        }
      });
    });
  });
}

async function readFromTextInput() {
  const { inputText: ip } = await inquirer.prompt([
    { type: 'input', name: 'inputText', message: 'Enter text:', },
  ]);
  console.log(chalk.green('Successfully read text.'));
  return ip;
}

async function askOperation() {
  const { operation } = await inquirer.prompt([
    { type: 'input', name: 'operation', message: 'What do you want to know?', },
  ]);
  return operation;
}

async function askQuestion() {
  const { question } = await inquirer.prompt([
    { type: 'input', name: 'question', message: 'What do you want to ask from this file?', },
  ]);
  console.log(chalk.blue(`Your question: ${question}`));
  return question;
}

async function translateUserText(inputText) {
  const { language } = await inquirer.prompt([
    { type: 'input', name: 'language', message: 'Enter language:', },
  ]);
  return decodePrompt(translateText).replace('REQ_TEXT', inputText).replace('REQ_LANG', language);
}

async function generateUserCode(inputText) {
  const { language } = await inquirer.prompt([
    { type: 'list', name: 'language', message: 'Select language:', choices: popularLanguages, },
  ]);
  return decodePrompt(generateCode).replace('REQ_TEXT', inputText).replace('REQ_LANG', language);
}
