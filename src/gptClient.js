import { ChatGPTBrowserClient } from '@waylaidwanderer/chatgpt-api';
import ky from 'ky';
import dotenv from 'dotenv';
dotenv.config();

/**
 * This function retrieves a token from a backend database, sets client options, and returns a
 * ChatGPTBrowserClient.
 * @returns The function `getChatGptClient` is returning an instance of the `ChatGPTBrowserClient`
 * class, which is created using the `clinetOptions` object. The `clinetOptions` object contains the
 * `reverseProxyUrl`, `accessToken`, and `cookies` properties, which are used to configure the client.
 */
export const getChatGptClient = async () => {
  const res = await ky.get(process.env.BACKEND_DB).json();
  const token = res.token;

  const clinetOptions = {
    reverseProxyUrl: process.env.REVERSE_PROXY_URL,
    accessToken: token,
    cookies: '',
  }

  const chatGptClient = new ChatGPTBrowserClient(clinetOptions);

  return chatGptClient;
}
