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

const printResponse = (responseText) => {
  console.log(chalk.green('Input: \n'));
  console.log(marked(responseText));
}

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
