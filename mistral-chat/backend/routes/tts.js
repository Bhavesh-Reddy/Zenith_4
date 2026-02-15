const express = require('express');
const router = express.Router();
const axios = require('axios');

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel voice

router.post('/', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'ElevenLabs API key not configured',
        fallback: true 
      });
    }

    const cleanText = text.substring(0, 2500).trim();
    const selectedVoice = voiceId || DEFAULT_VOICE_ID;

    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${selectedVoice}`,
      {
        text: cleanText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.byteLength
    });
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('TTS error:', error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid ElevenLabs API key', fallback: true });
    }
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'TTS rate limit exceeded', fallback: true });
    }
    
    res.status(500).json({ error: 'TTS failed', fallback: true, message: error.message });
  }
});

router.get('/voices', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.json({ voices: [] });
    }

    const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
      headers: { 'xi-api-key': apiKey }
    });
    
    res.json({ voices: response.data.voices || [] });
  } catch (error) {
    res.json({ voices: [] });
  }
});

module.exports = router;
