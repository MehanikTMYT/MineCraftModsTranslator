// AI.mjs
import { openai } from './utils.mjs';

async function aiTranslateFunction(text, targetLanguage) {
  const response = await openai.chat.completions.create({
    model: "deepseek/deepseek-r1:free",
    messages: [
      {
        role: "user",
        content: `Translate the following text into ${targetLanguage}: ${text}`,
      },
    ],
  });
  return response.choices[0].message.content.trim();
}

export { aiTranslateFunction };
