const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { sendDistressAlertEmail } = require("../services/emailService");
const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: 'uploads/' });

// ── Crisis / Distress Keywords (English + Arabic) ──
const CRISIS_KEYWORDS = [
  // English — suicidal / self-harm
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'wanna die',
  'wish i was dead', 'wish i were dead', 'better off dead', 'kill me',
  'self harm', 'hurt myself', 'harm myself', 'cut myself', 'cutting myself',
  'no reason to live', 'no point in living', 'dont want to live', 'don\'t want to live',
  'can\'t go on', 'cannot go on', 'end it all', 'take my life', 'overdose',
  // English — severe distress
  'can\'t breathe', 'panic attack', 'breaking down', 'falling apart',
  'can\'t cope', 'help me please', 'i give up',
  // Arabic — suicidal / self-harm
  'عايز انتحر', 'عاوز انتحر', 'انتحار', 'هنتحر', 'حنتحر', 'نفسي اموت',
  'عايز اموت', 'عاوز اموت', 'اريد الموت', 'اتمنى الموت', 'اموت نفسي',
  'هموت نفسي', 'اقتل نفسي', 'اأذي نفسي', 'ااذي نفسي', 'اضر نفسي',
  'مش عايز اعيش', 'مش عاوز اعيش', 'كرهت حياتي', 'تعبت من الحياة',
  'الموت احسن', 'الموت اريح', 'مفيش فايدة', 'مفيش أمل', 'مفيش امل',
  'انهي حياتي', 'انهي عمري', 'اقطع شراييني'
];

/**
 * Helper to normalize text for comparison
 */
const normalizeText = (text) => {
  if (!text) return "";
  let norm = text.toLowerCase();
  
  // English normalization: e.g. "my self" -> "myself"
  norm = norm.replace(/\bmy\s+self\b/g, "myself");
  norm = norm.replace(/\bself\s+harm\b/g, "self-harm");
  
  // Arabic normalization:
  // - Replace alef forms (أ, إ, آ) with plain alef (ا)
  // - Replace teh marbuta (ة) with heh (ه)
  // - Replace alef maqsura (ى) with yeh (ي)
  norm = norm.replace(/[أإآ]/g, "ا");
  norm = norm.replace(/ة/g, "ه");
  norm = norm.replace(/ى/g, "ي");
  
  // Remove punctuation that might split words
  norm = norm.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ");
  norm = norm.replace(/\s+/g, " ");
  
  return norm.trim();
};

/**
 * Check if a message contains crisis-level distress keywords
 */
const detectCrisis = (text) => {
  if (!text) return false;
  const normalizedInput = normalizeText(text);
  return CRISIS_KEYWORDS.some(kw => {
    const normalizedKw = normalizeText(kw);
    return normalizedInput.includes(normalizedKw);
  });
};

// ── Smart fallback responses when Python AI is offline or quota exceeded ──
const FALLBACKS = {
  sad: [
    "I hear you. You don't have to be okay right now. I'm right here with you — take your time.",
    "What you're feeling is completely valid. Sometimes the weight of sadness needs to be acknowledged before it can lift. I'm listening.",
    "It's okay to feel this way. You don't need to rush through this. I'm here whenever you're ready to share more.",
  ],
  anxious: [
    "Let's slow things down together. Take one slow breath — in for 4 counts, hold for 4, out for 4. I'm right here with you.",
    "Anxiety can feel so overwhelming. Let's ground ourselves — can you name 3 things you can see around you right now?",
    "I feel your tension. Let's take this one small step at a time. What's the one thing weighing on you most right now?",
  ],
  stressed: [
    "One thing at a time. You're doing your best and that is genuinely enough.",
    "Stress can make everything feel urgent at once. Let's breathe and simplify — what's the single most important thing right now?",
    "You're carrying a lot. That takes strength. Let's figure this out together, step by step.",
  ],
  angry: [
    "It's completely okay to feel this way. Your feelings are valid. What's the heaviest part of what's bothering you?",
    "I hear your frustration. Sometimes anger is just pain looking for an exit. I'm here — tell me what happened.",
    "That sounds really difficult and your reaction makes complete sense. What do you need most right now?",
  ],
  fearful: [
    "You are safe here. Let's ground ourselves — feel your feet on the floor. You are present. You are okay.",
    "Fear is your mind trying to protect you. Let's face it together, gently. What feels most frightening right now?",
    "I'm right here with you. Take a slow breath. Whatever it is, we can look at it together.",
  ],
  overwhelmed: [
    "Let's simplify everything right now. Just one single breath for now. In... and out. That's it.",
    "When everything feels too much, we start with just one small thing. What's the tiniest step you could take right now?",
    "I hear you. It's okay to feel overwhelmed — it means you care. Let's break this down into something manageable together.",
  ],
  neutral: [
    "I'm here to listen. Tell me what's on your mind.",
    "How are you really feeling today? I'm all yours.",
    "I'm here for you. What would you like to talk about?",
  ],
};

const getFallback = (text = "") => {
  const t = text.toLowerCase();
  let category = "neutral";
  if (/sad|cry|depress|hopeless|lonely|grief|loss|empty/.test(t)) category = "sad";
  else if (/anxious|panic|worry|scared|nervous|dread|afraid/.test(t)) category = "anxious";
  else if (/stress|exhaust|tired|drain|burnout|busy|pressure/.test(t)) category = "stressed";
  else if (/angry|rage|frustrat|hate|mad|furious|upset/.test(t)) category = "angry";
  else if (/scared|fear|afraid|terrif/.test(t)) category = "fearful";
  else if (/overwhelm|too much|can't cope|falling apart/.test(t)) category = "overwhelmed";
  const options = FALLBACKS[category];
  return options[Math.floor(Math.random() * options.length)];
};

// POST /api/chat
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { text, message, context, conversationId } = req.body;
    const inputText = text || message || "";
    const userId = req.user.id || req.user._id;

    if (!inputText) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    // Save user message (non-blocking — don't fail if DB write fails)
    let convId = conversationId || null;
    try {
      if (!convId) {
        const newConv = await Conversation.create({ user: userId, title: inputText.substring(0, 30) });
        convId = newConv._id;
      } else {
        // Update the conversation's updatedAt timestamp
        await Conversation.findByIdAndUpdate(convId, { updatedAt: new Date() });
      }
      await Message.create({ conversationId: convId, sender: "user", content: inputText });
    } catch (dbErr) {
      console.warn("DB write skipped:", dbErr.message);
    }

    // Try calling Python AI service
    const pythonAiUrl = process.env.PYTHON_AI_URL || "http://127.0.0.1:5001/api/chat";
    let aiResponse = null;
    let aiEmotionTag = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const pyRes = await fetch(pythonAiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, user_id: userId, context }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        aiResponse = pyData.response || pyData.message || null;
        aiEmotionTag = pyData.emotion?.primary_emotion || null;
      }
    } catch (pyErr) {
      console.warn("Python AI offline, using fallback:", pyErr.message);
    }

    // Use fallback if Python didn't respond
    if (!aiResponse) {
      aiResponse = getFallback(inputText);
    }

    // Save AI reply
    if (convId && aiResponse) {
      await Message.create({
        conversationId: convId,
        sender: "ai",
        content: aiResponse,
        emotionTag: aiEmotionTag,
      }).catch((e) => console.error("Error saving AI message:", e));
    }

    // 🚨 Crisis Detection — send emergency email alert (non-blocking)
    if (detectCrisis(inputText)) {
      console.log("🚨 CRISIS DETECTED in chat message from user:", userId);
      // Fire-and-forget: don't block the response
      (async () => {
        try {
          const userDoc = await User.findById(userId);
          if (userDoc?.emergencyContact?.email) {
            await sendDistressAlertEmail(userDoc, inputText);
            console.log("🚨 Emergency email alert sent to:", userDoc.emergencyContact.email);
          } else {
            console.log("🚨 Crisis detected but no emergency email configured for user.");
          }
          // Also flag user as high risk
          await User.findByIdAndUpdate(userId, { isHighRisk: true });
        } catch (alertErr) {
          console.error("🚨 Failed to process crisis alert:", alertErr.message);
        }
      })();
    }

    res.status(200).json({
      success: true,
      data: { response: aiResponse },
      conversationId: convId,
    });

  } catch (error) {
    console.error("Chat route error:", error);
    // Always return something — never leave frontend hanging
    res.status(200).json({
      success: true,
      data: { response: getFallback(req.body?.text || "") },
    });
  }
});

// GET /api/chat/tts - Streaming endpoint for instant playback
router.get("/tts", authMiddleware, async (req, res, next) => {
  try {
    const text = req.query.text;
    if (!text) return res.status(400).json({ success: false, message: "Text required" });

    const pythonTtsUrl = (process.env.PYTHON_AI_URL || "http://127.0.0.1:5001/api/chat").replace("/chat", "/tts/stream");

    const response = await fetch(pythonTtsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`TTS failed: ${response.status}`);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error("TTS streaming error:", error);
    res.status(500).end();
  }
});

// POST /api/chat/tts
router.post("/tts", authMiddleware, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text required" });

    const pythonTtsUrl = (process.env.PYTHON_AI_URL || "http://127.0.0.1:5001/api/chat").replace("/chat", "/tts");

    const response = await fetch(pythonTtsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`TTS failed: ${response.status}`);
    const ttsData = await response.json();
    res.status(200).json({ success: true, audio_base64: ttsData.audio_base64 });
  } catch (error) {
    res.status(200).json({ success: false, message: "TTS unavailable" });
  }
});

// POST /api/chat/voice-to-text
router.post("/voice-to-text", authMiddleware, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No audio file provided" });

    const pythonVoiceUrl = (process.env.PYTHON_AI_URL || "http://127.0.0.1:5001/api/chat").replace("/chat", "/voice-to-text");

    const buffer = fs.readFileSync(req.file.path);
    const blob = new Blob([buffer], { type: req.file.mimetype || 'audio/webm' });

    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');

    const response = await fetch(pythonVoiceUrl, {
      method: "POST",
      body: formData,
    });

    // Cleanup temp file
    fs.unlink(req.file.path, () => {});

    if (!response.ok) throw new Error(`Voice transcription failed: ${response.status}`);
    const data = await response.json();
    res.status(200).json({ success: true, text: data.text });
  } catch (error) {
    console.error("Voice to text error:", error);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ success: false, message: error.message + " | " + (error.stack || "") });
  }
});

// GET /api/chat/conversations - Retrieve all conversations for the logged-in user
router.get("/conversations", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const conversations = await Conversation.find({ user: userId }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error("Failed to retrieve conversations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/chat/history/:conversationId - Retrieve all messages for a specific conversation
router.get("/history/:conversationId", authMiddleware, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });
      
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Failed to retrieve chat history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
