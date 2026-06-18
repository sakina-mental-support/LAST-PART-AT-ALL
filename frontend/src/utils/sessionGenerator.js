/**
 * Emotional Experience Generator System
 * Procedurally assembles unique wellness sessions based on 5 layers:
 * Emotional, Cognitive, Sensory, Narrative, and Interaction.
 */

const LAYERS = {
    EMOTIONAL: ['Stressed', 'Anxious', 'Overwhelmed', 'Tired', 'Calm'],
    COGNITIVE: [
        { type: 'Thought Dissolve', technique: 'Cognitive Disruption' },
        { type: 'Perspective Flip', technique: 'Reality Reframing' },
        { type: 'Neural Slowdown', technique: 'Attention Restoration' },
        { type: 'Pattern Break', technique: 'Interruption' },
        { type: 'Identity Mirror', technique: 'Self-Mapping' }
    ],
    SENSORY: [
        { world: 'Ocean World', color: 'teal', effect: 'waves', audio: 'Ocean' },
        { world: 'Fog World', color: 'indigo', effect: 'blur', audio: 'Rain' },
        { world: 'Night Sky World', color: 'navy', effect: 'stars', audio: 'Theta' },
        { world: 'Forest World', color: 'emerald', effect: 'leaves', audio: 'Forest' },
        { world: 'Empty Space', color: 'slate', effect: 'pulse', audio: 'Silence' }
    ],
    NARRATIVE: [
        "You are walking through a calm storm...",
        "Your thoughts turn into clouds and dissolve...",
        "You descend into a quiet emotional ocean...",
        "A soft light guides your nervous system back...",
        "The gravity of your stress is slowly lifting..."
    ],
    INTERACTION: ['Passive', 'Active Pulse', 'Guided Scan', 'Immersive Drift']
};

export const generateExperience = (userMood = 'Balanced') => {
    // 1. Pick Cognitive Technique based on Mood
    const cognitive = LAYERS.COGNITIVE[Math.floor(Math.random() * LAYERS.COGNITIVE.length)];
    
    // 2. Pick Sensory World (Mood-Aligned or Randomized for Variety)
    const moodWorldMap = {
        'Stressed': LAYERS.SENSORY[0], // Ocean
        'Anxious': LAYERS.SENSORY[1],  // Fog
        'Overwhelmed': LAYERS.SENSORY[4], // Empty Space
        'Tired': LAYERS.SENSORY[2],    // Night Sky
        'Calm': LAYERS.SENSORY[3],     // Forest
        'Balanced': LAYERS.SENSORY[Math.floor(Math.random() * LAYERS.SENSORY.length)]
    };
    const sensory = moodWorldMap[userMood] || moodWorldMap['Balanced'];

    // 3. Narrative Selection
    const narrative = LAYERS.NARRATIVE[Math.floor(Math.random() * LAYERS.NARRATIVE.length)];
    
    // 4. Interaction Selection
    const interaction = LAYERS.INTERACTION[Math.floor(Math.random() * LAYERS.INTERACTION.length)];

    // 5. Build Dynamic Title (e.g., "Ocean Drift Cognitive Reset")
    const titleParts = [sensory.world.split(' ')[0], interaction.split(' ').pop(), cognitive.type];
    const title = titleParts.join(' ');

    return {
        id: `gen-${Date.now()}`,
        title: title,
        duration: Math.floor(Math.random() * (10 - 2 + 1)) + 2, // 2-10 mins
        moodTarget: userMood,
        world: sensory.world,
        color: sensory.color,
        effect: sensory.effect,
        audio: sensory.audio,
        technique: cognitive.technique,
        narrative: narrative,
        interaction: interaction,
        steps: [
            "Initialize Emotional Connection",
            `Activate ${sensory.world} Atmosphere`,
            `Begin ${cognitive.type} Protocol`,
            "Integrate Neural Feedback",
            "Return to Presence"
        ],
        imageUrl: `https://source.unsplash.com/1600x900/?${sensory.world.split(' ')[0].toLowerCase()},abstract,peaceful`
    };
};
