import ora from 'ora';
import chalk from 'chalk';
import { getChatGptClient } from './gptClient.js';
import { selectOutputMethod } from './outputHandler.js';
import { encodedPrompts as prompts } from './prompts.js';

const { commentCode, gitDiff, summarizeText } = prompts

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
 * This function handles various operations such as asking a question, summarizing text, translating
 * text, generating code, adding comments to code, asking PDF/URL, and generating Git messages.
 * @param input - The input text to be processed by the selected operation.
 * @param selectedOperation - The selected operation is a string that represents the user's choice of
 * operation to perform. It determines which value from the `operations` object will be used as input
 * for the GPT-3 API.
 * @param [fileQuestion] - `fileQuestion` is an optional parameter that represents a question that may
 * be appended to the `input` parameter if it is provided. It is used in the `Ask a question` operation
 * to allow the user to ask a specific question related to the input. If `fileQuestion` is not provided
 * @returns The function `handleOperation` returns a Promise that resolves when the response from the
 * `chatGptClient` is received and processed, or rejects if there is an error. The response is passed
 * to the `selectOutputMethod` function, which handles how the response is displayed to the user based
 * on the selected operation.
 */
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
