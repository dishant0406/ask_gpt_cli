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

/**
 * The function decodes a base64 encoded string and returns the corresponding ASCII string.
 * @param prompt - The input string that is encoded in base64 format and needs to be decoded.
 * @returns The function `decodePrompt` takes a string `prompt` encoded in base64 and returns the
 * decoded string in ASCII format.
 */
const decodePrompt = (prompt) => {
  return Buffer.from(prompt, 'base64').toString('ascii');
}

/**
 * The function `selectInputMethod` allows the user to select an input method and perform various
 * operations on the input text based on the selected operation.
 * @param selectedOperation - The selected operation is a string that represents the user's choice of
 * what action they want to perform. It could be "Ask PDF", "Ask URL", "Generate Git Message", "File",
 * "Text", "Translate text", or "Generate code".
 */
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

/**
 * This function reads a file as a PDF and returns its text content.
 * @returns the text content of a PDF file that is read from the file path entered by the user.
 */
async function readFileAsPdf() {
  const { filePath } = await inquirer.prompt([
    { type: 'input', name: 'filePath', message: 'Enter file path:', },
  ]);
  let dataBuffer = fs.readFileSync(filePath);
  let pdfData = await pdf(dataBuffer);
  console.log(chalk.green('\nSuccessfully read file.'));
  return pdfData.text;
}

/**
 * This function prompts the user to enter a URL, fetches the website content from the URL, and returns
 * the website data in JSON format.
 * @returns a JSON stringified version of the data fetched from the URL entered by the user.
 */
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

/**
 * This function fetches the git diff and returns it as a JSON string with some unnecessary properties
 * removed.
 * @returns A Promise object is being returned.
 */
function fetchGitDiff() {
  return new Promise((resolve, reject) => {
    exec('git diff', { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) {
        reject('Error loading git diff.');
      } else {
        console.log(chalk.green('\nSuccessfully read git diff.'));
        let diff = parseDiff(stdout);
        let newDiff = diff.map((change) => {
          delete change.newMode
          delete change.oldMode
          delete change.additions
          delete change.deletions
          return change
        })
        if (JSON.stringify(newDiff).length > 4096) {
          diff = JSON.stringify(newDiff).substring(0, 4096);
        } else {
          diff = JSON.stringify(newDiff)
        }
        console.log(diff)
        resolve(diff);
      }
    });
  });
}

/**
 * This function prompts the user to select an input method and returns the selected method.
 * @returns The `selectInput()` function is returning the selected input method from the list of
 * choices provided by the `inquirer` prompt. Specifically, it is returning the `method` property of
 * the object returned by the `inquirer.prompt()` function.
 */
async function selectInput() {
  const { method } = await inquirer.prompt([
    { type: 'list', name: 'method', message: 'Choose input method:', choices: options.inputMethods, },
  ]);
  return method;
}

/**
 * This function reads a file from a given file path and returns a promise that resolves with the file
 * data or rejects with an error message.
 * @param selectedOperation - It seems that the parameter `selectedOperation` is not used in the given
 * code snippet. It is possible that it is used in other parts of the program.
 * @returns A Promise object is being returned.
 */
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

/**
 * The function prompts the user to enter text and returns the input.
 * @returns the text input entered by the user.
 */
async function readFromTextInput() {
  const { inputText: ip } = await inquirer.prompt([
    { type: 'input', name: 'inputText', message: 'Enter text:', },
  ]);
  console.log(chalk.green('Successfully read text.'));
  return ip;
}

/**
 * This function prompts the user to input a question and returns the input as a string.
 * @returns The function `askOperation()` is returning the user's input from the `operation` prompt
 * question.
 */
async function askOperation() {
  const { operation } = await inquirer.prompt([
    { type: 'input', name: 'operation', message: 'What do you want to know?', },
  ]);
  return operation;
}

/**
 * The function prompts the user to input a question and returns the question.
 * @returns The function `askQuestion()` is returning the user's inputted question as a string.
 */
async function askQuestion() {
  const { question } = await inquirer.prompt([
    { type: 'input', name: 'question', message: 'What do you want to ask from this file?', },
  ]);
  console.log(chalk.blue(`Your question: ${question}`));
  return question;
}

/**
 * The function prompts the user to enter a language and then replaces placeholders in a translated
 * text with the user's input and chosen language.
 * @param inputText - The input text that the user wants to translate.
 * @returns a string that is the result of calling the `decodePrompt` function with the `translateText`
 * argument, and then replacing the placeholders `REQ_TEXT` and `REQ_LANG` with the `inputText` and
 * `language` values respectively.
 */
async function translateUserText(inputText) {
  const { language } = await inquirer.prompt([
    { type: 'input', name: 'language', message: 'Enter language:', },
  ]);
  return decodePrompt(translateText).replace('REQ_TEXT', inputText).replace('REQ_LANG', language);
}

/**
 * The function generates user code based on the input text and selected programming language.
 * @param inputText - The input text is a string that represents the user's input or request. It will
 * be used to replace the 'REQ_TEXT' placeholder in the generated code.
 * @returns a Promise that resolves to a string. The string is generated by calling the `decodePrompt`
 * function on the `generateCode` variable, and then replacing the placeholders `REQ_TEXT` and
 * `REQ_LANG` with the `inputText` and `language` values respectively.
 */
async function generateUserCode(inputText) {
  const { language } = await inquirer.prompt([
    { type: 'list', name: 'language', message: 'Select language:', choices: popularLanguages, },
  ]);
  return decodePrompt(generateCode).replace('REQ_TEXT', inputText).replace('REQ_LANG', language);
}
