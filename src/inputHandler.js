import inquirer from 'inquirer';
import chalk from 'chalk';
import { selectInputMethod } from './selectInputMethod.js';

const options = {
  operations: ['Ask a question', 'Summarize text', 'Translate text', 'Generate code', 'Add comments to code', 'Ask PDF', 'Ask URL', 'Generate Git Message'],
}

/**
 * This function prompts the user to select an operation and then logs the selected operation and calls
 * another function to select the input method.
 */
export const askQuestion = async () => {
  const { operation } = await inquirer.prompt([
    {
      type: 'list',
      name: 'operation',
      message: 'Select an operation:',
      choices: options.operations,
    },
  ]);

  console.log(chalk.blue(`You chose: ${operation}`));
  await selectInputMethod(operation);
};