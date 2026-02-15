const express = require('express');
const router = express.Router();
const axios = require('axios');

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const MODELS = [
  'mistralai/Mistral-7B-Instruct-v0.1',
  'HuggingFaceH4/zephyr-7b-beta',
  'HuggingFaceTB/SmolLM3-3B',
  'tiiuae/falcon-7b-instruct',
];

const BASE_URL = 'https://router.huggingface.co/v1';

function cleanResponse(text) {
  if (!text) return text;
  // Remove <think>...</think> blocks (Qwen and other reasoning models)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  // Remove <|thinking|>...</|thinking|> variants
  text = text.replace(/<\|thinking\|>[\s\S]*?<\|\/thinking\|>/gi, '');
  // Remove [INST] leftovers
  text = text.replace(/\[INST\][\s\S]*?\[\/INST\]/g, '');
  // Remove leading/trailing whitespace
  return text.trim();
}

async function callModel(model, messages) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY is not set in environment variables');

  const response = await axios.post(
    `${BASE_URL}/chat/completions`,
    { model, messages, max_tokens: 1024, temperature: 0.7, stream: false },
    {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 120000
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (content) return cleanResponse(content);
  throw new Error('Empty response');
}

async function callWithFallback(messages, modelIndex = 0, retryCount = 0) {
  if (modelIndex >= MODELS.length) {
    throw new Error('All models failed. Please check your API key has "Make calls to Inference Providers" permission at huggingface.co/settings/tokens');
  }

  const model = MODELS[modelIndex];
  console.log(`Trying model: ${model}`);

  try {
    return await callModel(model, messages);
  } catch (error) {
    const status = error.response?.status;
    const errMsg = error.response?.data?.error?.message || error.response?.data?.error || error.message;
    console.log(`Model ${model} failed [${status}]: ${errMsg}`);

    if (status === 401) {
      throw new Error('Invalid API key. Make sure your token has "Make calls to Inference Providers" permission: huggingface.co/settings/tokens');
    }
    if (status === 429 && retryCount < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return callWithFallback(messages, modelIndex, retryCount + 1);
    }
    if (status === 503 && retryCount < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, RETRY_DELAY * (retryCount + 1)));
      return callWithFallback(messages, modelIndex, retryCount + 1);
    }
    return callWithFallback(messages, modelIndex + 1, 0);
  }
}

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemMessage = {
      role: 'system',
      content: 'You are a helpful, intelligent AI assistant called Mistral. Be concise, accurate, and friendly. Never show your thinking process or reasoning steps.'
    };

    const recentMessages = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    const responseText = await callWithFallback([systemMessage, ...recentMessages]);

    res.json({
      success: true,
      message: { role: 'assistant', content: responseText }
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    let statusCode = 500;
    if (error.message.includes('API key') || error.message.includes('Invalid')) statusCode = 401;
    res.status(statusCode).json({ success: false, error: error.message });
  }
});

module.exports = router;