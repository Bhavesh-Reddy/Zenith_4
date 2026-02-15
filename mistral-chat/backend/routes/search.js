const express = require('express');
const router = express.Router();
const axios = require('axios');
const Tesseract = require('tesseract.js');

const BASE_URL = 'https://router.huggingface.co/v1';

const CHAT_MODELS = [
  'mistralai/Mistral-7B-Instruct-v0.1',
  'HuggingFaceH4/zephyr-7b-beta',
  'HuggingFaceTB/SmolLM3-3B',
];

function cleanResponse(text) {
  if (!text) return text;
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  text = text.replace(/<\|thinking\|>[\s\S]*?<\|\/thinking\|>/gi, '');
  return text.trim();
}

// ── OCR: extract text using Tesseract.js (runs 100% locally, no API needed) ──
async function extractText(base64Image) {
  try {
    const imageBuffer = Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: () => {} // suppress logs
    });

    const text = data.text?.trim() || '';
    const confidence = data.confidence || 0;
    console.log(`OCR confidence: ${confidence.toFixed(1)}%, chars: ${text.length}`);
    return { text, confidence };
  } catch (err) {
    console.log('OCR failed:', err.message);
    return { text: '', confidence: 0 };
  }
}

// ── Image caption via HF BLIP ─────────────────────────────────────────────────
async function getImageCaption(base64Image, apiKey) {
  try {
    const imageBuffer = Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    const res = await axios.post(
      'https://router.huggingface.co/hf-inference/models/Salesforce/blip-image-captioning-large',
      imageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 30000
      }
    );
    return res.data?.[0]?.generated_text || '';
  } catch (err) {
    console.log('BLIP caption failed:', err.message);
    return '';
  }
}

// ── Chat model with fallback ──────────────────────────────────────────────────
async function callChatModel(messages, modelIndex = 0) {
  if (modelIndex >= CHAT_MODELS.length) throw new Error('All models failed');
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = CHAT_MODELS[modelIndex];

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      { model, messages, max_tokens: 1024, temperature: 0.7, stream: false },
      {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );
    const content = response.data?.choices?.[0]?.message?.content;
    if (content) return cleanResponse(content);
    throw new Error('Empty response');
  } catch (err) {
    console.log(`Model ${model} failed: ${err.response?.status} ${err.message}`);
    return callChatModel(messages, modelIndex + 1);
  }
}

// ── Main route ────────────────────────────────────────────────────────────────
router.post('/image', async (req, res) => {
  try {
    const { imageData, query } = req.body;
    if (!imageData) return res.status(400).json({ error: 'Image data is required' });

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'API key not configured' });

    console.log('Circle to Search: processing image...');

    // Run OCR + caption in parallel
    const [ocrResult, caption] = await Promise.all([
      extractText(imageData),
      getImageCaption(imageData, apiKey)
    ]);

    const { text: ocrText, confidence } = ocrResult;
    const hasText = ocrText.length > 10 && confidence > 30;

    console.log(`OCR text: "${ocrText.substring(0, 80)}..." | Caption: "${caption}"`);

    // Build context string for AI
    let imageContext = '';

    if (hasText) {
      imageContext += `**Text found in the image (OCR):**\n\`\`\`\n${ocrText}\n\`\`\`\n\n`;
    }

    if (caption) {
      imageContext += `**Image description:** ${caption}\n\n`;
    }

    if (!hasText && !caption) {
      imageContext = 'The image content could not be automatically detected.\n\n';
    }

    const userQuestion = query?.trim() || 'What is this? Please explain in detail.';

    const userContent = `I captured this area from my screen using a screen selection tool.

${imageContext}**My question:** ${userQuestion}

Please give me a clear, helpful answer. If there is text in the image, read and explain it. If it's a visual element, describe and explain what you see.`;

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful visual AI assistant. The user has selected an area from their screen. Analyze the provided OCR text and image description carefully, then give a clear, accurate, and useful answer to their question.'
      },
      { role: 'user', content: userContent }
    ];

    const aiResponse = await callChatModel(messages);

    res.json({
      success: true,
      ocrText: hasText ? ocrText : '',
      caption,
      response: aiResponse
    });

  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      response: `Could not analyze the image: ${error.message}`
    });
  }
});

module.exports = router;