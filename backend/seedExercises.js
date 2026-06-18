const mongoose = require("mongoose");
require("dotenv").config();
const Exercise = require("./models/Exercise");

const exercises = [
  {
    title: "Deep Breathing Focus",
    description: "A simple yet powerful technique to calm your nervous system and reduce immediate stress.",
    duration: "5",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    category: "Breathing",
    content: "Sit comfortably. Inhale for 4 seconds, hold for 4, exhale for 4, and hold for 4. Repeat."
  },
  {
    title: "Mindful Walking",
    description: "Ground yourself by connecting with the physical sensation of movement and the environment around you.",
    duration: "10",
    imageUrl: "https://images.unsplash.com/photo-1476136230910-24293e430379?auto=format&fit=crop&w=800&q=80",
    category: "Movement",
    content: "Walk slowly. Focus on the sensation of your feet touching the ground. Notice your surroundings without judgment."
  },
  {
    title: "Gratitude Journaling",
    description: "Shifting your focus to the positive aspects of your life to improve mood and long-term well-being.",
    duration: "15",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    category: "Journaling",
    content: "Write down three things you are grateful for today and why they made a difference."
  },
  {
    title: "Body Scan Meditation",
    description: "Check in with every part of your body to release tension and improve physical awareness.",
    duration: "20",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    category: "Meditation",
    content: "Lie down. Starting from your toes, move your attention slowly up to your head, noticing any tension and breathing into it."
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    await Exercise.deleteMany({});
    console.log("Cleared existing exercises.");
    
    await Exercise.insertMany(exercises);
    console.log("Seeded exercises successfully! ✅");
    
    process.exit();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
