import ora from 'ora';
import chalk from 'chalk';
import { getChatGptClient } from './gptClient.js';
import { selectOutputMethod } from './outputHandler.js';
import { encodedPrompts as prompts } from './prompts.js';

const { commentCode, gitDiff, summarizeText } = prompts

const decodePrompt = (prompt) => {
  return Buffer.from(prompt, 'base64').toString('ascii');
}

export const handleOperation = async (input, selectedOperation, fileQuestion = '') => {
  const spinner = ora('Loading response...').start();
  const chatGptClient = await getChatGptClient();

  let inputText = fileQuestion ? `${input}\n\nQ: ${fileQuestion}` : input;

  const operations = {
    'Ask a question': inputText,
    'Summarize text': `${decodePrompt(summarizeText)}\n${inputText}`,
    'Translate text': inputText,
    'Generate code': inputText,
    'Add comments to code': decodePrompt(commentCode).replace('REQ_TEXT', inputText),
    'Ask PDF': inputText,
    'Ask URL': inputText,
    'Generate Git Message': decodePrompt(gitDiff).replace('REQ_TEXT', inputText),
  };

  try {
    const response = await chatGptClient.sendMessage(operations[selectedOperation]);
    spinner.stop();
    selectOutputMethod(response.response, selectedOperation);
    return Promise.resolve();
  } catch (err) {
    spinner.fail();
    console.log(chalk.red('Error loading response.'));
    return Promise.reject();
  }
}
