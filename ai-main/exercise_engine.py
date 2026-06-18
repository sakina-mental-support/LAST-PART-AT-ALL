class ExerciseEngine:
    def __init__(self):
        # Mapping base emotions to specific recommended exercises
        # Available model labels: anger, disgust, fear, joy, neutral, sadness, surprise (model dependent)
        # We will map them to the core logic requested: Stress, Sad, Angry, Anxiety -> Exercises
        self.emotion_exercise_map = {
            "anger": {
                "name": "Pause and Reflection",
                "instruction": "Take a 5-minute pause away from the screen. Count backwards from 10, then write down exactly what triggered this feeling without judgment."
            },
            "fear": {
                "name": "Grounding Technique (5-4-3-2-1)",
                "instruction": "Let's ground ourselves. Acknowledge 5 things you can see around you, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste."
            },
            "sadness": {
                "name": "Journaling & Reframing",
                "instruction": "Write down a few sentences about what is weighing heavy on you right now. Next to each sentence, write one small thing you still have control over today."
            },
            "stress": { # Custom mapping since the model might output something else or we map based on keywords later
                "name": "Box Breathing",
                "instruction": "Inhale deeply for 4 seconds, hold your breath for 4 seconds, exhale slowly for 4 seconds, and hold empty for 4 seconds. Repeat 4 times."
            },
            "surprise": {
                "name": "Mindful Observation",
                "instruction": "Take a moment to absorb the new information. Drink a glass of water and take 3 deep breaths before responding to the situation."
            },
            "joy": {
                "name": "Gratitude Anchor",
                "instruction": "Take a mental photograph of this positive moment. Write down one reason why you feel good today, so you can revisit it later!"
            },
            "neutral": {
                "name": "Body Scan Check-in",
                "instruction": "Take 2 minutes to scan your body from head to toe. Notice any physical tension, especially in your jaw or shoulders, and consciously relax those muscles."
            }
        }
    
    def get_exercise_for_emotion(self, emotion_label: str) -> dict:
        """
        Returns a personalized exercise based on the detected emotion.
        If the exact emotion isn't mapped, it falls back to a neutral grounding exercise.
        """
        emotion = emotion_label.lower()
        
        # If the input contains signs of stress or anxiety specifically
        if "stress" in emotion or "anx" in emotion:
            return self.emotion_exercise_map["stress"]
            
        return self.emotion_exercise_map.get(emotion, self.emotion_exercise_map["neutral"])
