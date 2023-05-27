import inquirer from 'inquirer';
import fs from 'fs/promises';
import chalk from 'chalk';
import { mark } from './format.js';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
  renderer: new TerminalRenderer(),
  mangle: false,
  headerIds: false,
});

const outputMethods = ['Display', 'File'];

/**
 * The function `printResponse` logs a formatted response text to the console.
 * @param responseText - The parameter `responseText` is a string that represents the text that will be
 * printed to the console. It will be formatted using the `marked` library and then printed in green
 * using the `chalk` library.
 */
const printResponse = (responseText) => {
  console.log(chalk.green('Input: \n'));
  console.log(marked(responseText));
}

/**
 * This function prompts the user for a file path, writes the response text to the specified file path,
 * and logs a success message.
 * @param responseText - The response text that needs to be saved to a file.
 */
const saveResponseToFile = async (responseText) => {
  try {
    const { filePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter output file path:',
      },
    ]);

    await fs.writeFile(filePath, mark(responseText));
    console.log(chalk.green(`Successfully wrote output to file: ${filePath}`));
  } catch (err) {
    console.log(chalk.red('Error writing file.'));
  }
}

/**
 * The function allows the user to select an output method for a response text, either displaying it or
 * saving it to a file, with an additional option for generating a Git message.
 * @param responseText - The response text that needs to be outputted or saved to a file.
 * @param selectedOperation - The selected operation is a string that represents the operation that the
 * user wants to perform. In this case, it is "Generate Git Message".
 * @returns If the selected operation is 'Generate Git Message', nothing is returned. Otherwise, the
 * function prompts the user to choose an output method and performs the selected action (either
 * printing the response or saving it to a file). No explicit return value is specified in these cases.
 */
export const selectOutputMethod = async (responseText, selectedOperation) => {
  if (selectedOperation === 'Generate Git Message') {
    printResponse(responseText);
    return;
  }

  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Choose output method:',
      choices: outputMethods,
    },
  ]);

  switch (method) {
    case 'Display':
      printResponse(responseText);
      break;
    case 'File':
      await saveResponseToFile(responseText);
      break;
  }

  console.log(chalk.blue(`You chose: ${method}`));
};
