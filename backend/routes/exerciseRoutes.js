const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const recommendationService = require("../services/recommendationService");
const User = require("../models/User");
const Exercise = require("../models/Exercise");

const adminOnly = async (req, res, next) => {
  try {
    const adminUser = await User.findById(req.user.id || req.user._id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const result = await recommendationService.getRecommendations(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/generate", authMiddleware, async (req, res, next) => {
  try {
    const { assessment } = req.body;
    
    // Advanced Neural Protocols: 20+ Specialized Sessions
    const fallbackExercises = [
      // 1. NERVOUS SYSTEM RESET
      {
        title: "Vagus Nerve Activation",
        duration: "5",
        category: "Nervous System",
        level: "Beginner",
        moodTarget: ["Anxious", "Stressed", "Overwhelmed"],
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format,compress&q=90&w=1920",
        videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        description: "Direct stimulation of the vagus nerve to exit fight-or-flight mode.",
        steps: ["Tilt head right", "Look right 30s", "Deep swallow", "Repeat left"]
      },
      // 2. EMOTIONAL RELEASE
      {
        title: "Decompression Breath",
        duration: "8",
        category: "Emotional Release",
        level: "Intermediate",
        moodTarget: ["Sad", "Frustrated", "Angry"],
        imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format,compress&q=90&w=1920",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        description: "A somatic release practice for unblocking suppressed emotions.",
        steps: ["Lion's breath", "Full body shake", "Vocal exhale", "Settle in silence"]
      },
      // 3. OVERTHINKING INTERRUPTION
      {
        title: "Cognitive Loop Break",
        duration: "3",
        category: "Cognitive",
        level: "Beginner",
        moodTarget: ["Anxious", "Overwhelmed", "Stressed"],
        imageUrl: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format,compress&q=90&w=1920",
        videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        description: "Rapid sensory switching to interrupt negative thought loops.",
        steps: ["Name 3 red things", "Touch 2 textures", "Hum for 10s", "Cold water on face"]
      },
      // 4. DOPAMINE RECOVERY
      {
        title: "Digital Detox Reset",
        duration: "15",
        category: "Dopamine Recovery",
        level: "Intermediate",
        moodTarget: ["Tired", "Bored", "Low Energy"],
        imageUrl: "https://images.unsplash.com/photo-1447433589675-4aaa56a4009a?auto=format,compress&q=90&w=1920",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        description: "Recalibrate your attention span after high digital stimulation.",
        steps: ["Phone away", "Stare at single point", "Belly breathing", "Gentle eye scan"]
      },
      // 5. BURNOUT RECOVERY
      {
        title: "Cognitive Offload",
        duration: "20",
        category: "Burnout",
        level: "Advanced",
        moodTarget: ["Exhausted", "Stressed", "Tired"],
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format,compress&q=90&w=1920",
        videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        description: "A deep restorative session for mental exhaustion and burnout.",
        steps: ["Lie in darkness", "Release jaw", "Follow theta loop", "No-choice awareness"]
      },
      // 6. PANIC RECOVERY (Emergency)
      {
        title: "Immediate Grounding",
        duration: "2",
        category: "Emergency",
        level: "Beginner",
        moodTarget: ["Panicking", "Anxious", "Overwhelmed"],
        imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format,compress&q=90&w=1920",
        videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        description: "Emergency protocol for acute anxiety and panic moments.",
        steps: ["Pursed lip breath", "Feel your feet", "Acknowledge safety", "Cold touch"]
      },
      // 7. SOCIAL ANXIETY TRAINING
      {
        title: "Social Armor Prep",
        duration: "10",
        category: "Social Recovery",
        level: "Intermediate",
        moodTarget: ["Anxious", "Timid", "Stressed"],
        imageUrl: "https://images.unsplash.com/photo-1511295742364-91ac970ad19a?auto=format,compress&q=90&w=1920",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        description: "Calm the nervous system before social interactions.",
        steps: ["Power pose", "Box breathing", "Visual success", "Affirmation loop"]
      },
      // 8. TRAUMA-INFORMED
      {
        title: "Safe Space Anchor",
        duration: "12",
        category: "Trauma-Informed",
        level: "Beginner",
        moodTarget: ["Overwhelmed", "Anxious", "Sad"],
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format,compress&q=90&w=1920",
        videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        description: "Gentle visualization to rebuild internal safety.",
        steps: ["Soft gaze", "Focus on seat", "Safe place visual", "Breath tether"]
      },
      // 9. MOVEMENT RECOVERY
      {
        title: "Neural Stretching",
        duration: "6",
        category: "Movement",
        level: "Beginner",
        moodTarget: ["Tired", "Stressed", "Frustrated"],
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format,compress&q=90&w=1920",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        description: "Slow, intentional movements to release physical stress.",
        steps: ["Neck rolls", "Shoulder drop", "Torso twist", "Deep forward fold"]
      },
      // 10. SENSORY CALM
      {
        title: "Forest Immersion",
        duration: "15",
        category: "Sensory",
        level: "Beginner",
        moodTarget: ["Stressed", "Overwhelmed", "Sad"],
        imageUrl: "https://images.unsplash.com/photo-1447433589675-4aaa56a4009a?auto=format,compress&q=90&w=1920",
        videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        description: "Cinematic audio-visual immersion in a pristine forest environment.",
        steps: ["Eyes open", "Listen to birds", "Follow light", "Deep forest breath"]
      }
    ];

    let finalExercises = fallbackExercises;
    res.status(200).json({ success: true, exercises: finalExercises });

  } catch (error) {
    next(error);
  }
});

// Create a new exercise (Admin only)
router.post("/", authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { title, description, duration, imageUrl, category, content } = req.body;
    if (!title || !description || !duration || !imageUrl) {
      return res.status(400).json({ success: false, message: "Title, description, duration, and imageUrl are required" });
    }
    const exercise = await Exercise.create({
      title,
      description,
      duration,
      imageUrl,
      category: category || "Mindfulness",
      content
    });
    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
});

// Update an exercise (Admin only)
router.put("/:id", authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { title, description, duration, imageUrl, category, content } = req.body;
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { title, description, duration, imageUrl, category, content },
      { new: true, runValidators: true }
    );
    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found" });
    }
    res.json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
});

// Delete an exercise (Admin only)
router.delete("/:id", authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found" });
    }
    res.json({ success: true, message: "Exercise deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;