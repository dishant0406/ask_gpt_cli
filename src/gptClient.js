import { ChatGPTBrowserClient } from '@waylaidwanderer/chatgpt-api';
import ky from 'ky';
import dotenv from 'dotenv';
dotenv.config();

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
