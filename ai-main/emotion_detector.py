from transformers import pipeline

class EmotionDetector:
    def __init__(self):
        # We use DistilRoBERTa fine-tuned on the dair-ai/emotion dataset 
        # Labels: joy, sadness, anger, fear, love, surprise, neutral (depending on exact model)
        # Using a fast, highly accurate model for English emotion detection
        self.classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)
        
    def detect_emotion(self, text: str) -> dict:
        """
        Takes input text and returns the detected emotion and confidence score.
        """
        try:
            results = self.classifier(text)
            # The pipeline with top_k=1 returns a list containing a list of one dict: [[{'label': 'sadness', 'score': 0.98}]]
            prediction = results[0][0]
            
            emotion_label = prediction['label']
            confidence = prediction['score']
            
            return {
                "emotion": emotion_label,
                "confidence": confidence
            }
        except Exception as e:
            # Fallback in case of an error
            return {
                "emotion": "neutral",
                "confidence": 0.0,
                "error": str(e)
            }
