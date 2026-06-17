import OpenAI from 'openai'

export const llm = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const MODEL = 'deepseek/deepseek-chat'
