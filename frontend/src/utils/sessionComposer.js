/**
 * 🌌 Sakina Cinematic Narrative Engine v8.0
 * Each session is now a "Mission" with a unique Story, Cinematic Video, and Narrative.
 */

const NARRATIVES = {
    ns_reset: {
        title: "The Solar Flare Reset",
        story: "Your nervous system is currently carrying too much electrical noise. We are entering the Solar Chamber to burn away the static and leave only pure, calm energy.",
        video: "https://assets.mixkit.co/videos/preview/mixkit-abstract-gold-particles-moving-in-the-dark-40003-large.mp4",
        color: "#00adef" // Sakina Teal
    },
    mind_break: {
        title: "The Silent Nebula",
        story: "Your thoughts have become a storm. We are transporting you 10,000 light-years away to the Silent Nebula, where thoughts have no weight and words cannot reach.",
        video: "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-beautiful-nebula-in-space-31782-large.mp4",
        color: "#00adef"
    },
    yoga_flow: {
        title: "The Willow Protocol",
        story: "The body holds onto what the mind cannot process. Like a willow tree in a storm, we will practice flexibility today so that you can bend without breaking.",
        video: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
        color: "#00adef"
    },
    world_shift: {
        title: "The Deep Blue Abyss",
        story: "The world above is loud and heavy. Descend with me into the Deep Blue, where the pressure of life is replaced by the gentle weight of the ocean. Silence is your sanctuary.",
        video: "https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-bubbles-rising-to-the-surface-338-large.mp4",
        color: "#00adef"
    }
};

const SYSTEMS = {
    ns_reset: [
        { id: 'reset_sigh', title: 'Physiological Sigh', type: 'Instant Reset', icon: 'air', instruction: 'Double inhale through your nose. Now, a very long exhale through your mouth.' },
        { id: 'reset_cold', title: 'Cold Shock', type: 'Vagus Nerve Hack', icon: 'ac_unit', instruction: 'Imagine holding a cold ice pack to your chest. Feel your heart rate slow down.' }
    ],
    mind_break: [
        { id: 'ground_54321', title: 'Sensory Grounding', type: '5-4-3-2-1 Technique', icon: 'visibility', instruction: 'Name 3 things you can see right now. Look at their colors.' },
        { id: 'cog_freeze', title: 'Thought Freeze', type: 'Cognitive Stop', icon: 'pause_circle', instruction: 'STOP your thoughts completely for 5 seconds. Imagine your mind is clear glass.' }
    ],
    yoga_flow: [
        { id: 'yoga_child', title: 'Child’s Pose', type: 'Grounding Stretch', icon: 'self_improvement', instruction: 'Reach forward. Rest your forehead on the ground. Feel the earth supporting you.' },
        { id: 'yoga_catcow', title: 'Spinal Flow', type: 'Cat-Cow Stretch', icon: 'waves', instruction: 'Gently arch your back like a cat, then round it. Follow your breath.' }
    ],
    world_shift: [
        { id: 'escape_forest', title: 'Forest Bathing', type: 'Atmospheric Shift', world: 'Ancient Forest', icon: 'park', instruction: 'Smell the damp earth. Hear the rustle of the ancient leaves above you.' },
        { id: 'escape_ocean', title: 'Underwater Silence', type: 'Pressure Shift', world: 'Ocean Abyss', icon: 'water', instruction: 'Sink into the deep blue silence. The noise of the world is 1000 miles above.' }
    ]
};

export const composeEmotionalShift = (state) => {
    const { currentMood, stressLevel } = state;
    const profile = JSON.parse(localStorage.getItem('sakina_profile') || '{"name": "User"}');
    const userName = profile.name || 'Friend';

    // Select Narrative based on mood or system
    let narrativeKey = 'ns_reset';
    if (currentMood === 'Stiff') narrativeKey = 'yoga_flow';
    else if (currentMood === 'Anxious' || currentMood === 'Overwhelmed') narrativeKey = 'mind_break';
    else if (stressLevel < 50) narrativeKey = 'world_shift';

    const narrative = NARRATIVES[narrativeKey];
    const systems = Object.keys(SYSTEMS);
    const blocks = [];
    
    // Build a unique 3-block sequence
    for (let i = 0; i < 3; i++) {
        const sysType = systems[Math.floor(Math.random() * systems.length)];
        const pool = SYSTEMS[sysType];
        blocks.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    return {
        id: `shift-${Date.now()}`,
        title: narrative.title,
        story: narrative.story,
        video: narrative.video,
        accentColor: narrative.color,
        userName: userName,
        blocks: blocks,
        world: narrative.title.split(' ').pop(),
        color: narrativeKey === 'yoga_flow' ? 'teal' : 'navy',
        intensity: stressLevel,
        moodBefore: currentMood
    };
};

export const composeModularSession = composeEmotionalShift;
