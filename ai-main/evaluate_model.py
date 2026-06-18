from transformers import pipeline
from datasets import load_dataset
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# =====================================================
# LOAD MODEL
# =====================================================

classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=1
)

# =====================================================
# LOAD DATASET
# =====================================================

dataset = load_dataset("dair-ai/emotion")

test_data = dataset["test"]

# Dataset labels
label_names = [
    "sadness",
    "joy",
    "love",
    "anger",
    "fear",
    "surprise"
]

# =====================================================
# LABEL MAPPING
# =====================================================

# Convert dataset labels to model labels
mapping = {
    "sadness": "sadness",
    "joy": "joy",
    "love": "joy",      # map love -> joy
    "anger": "anger",
    "fear": "fear",
    "surprise": "surprise"
}

# =====================================================
# EVALUATION
# =====================================================

true_labels = []
pred_labels = []

MAX_SAMPLES = 1000

for sample in test_data.select(range(MAX_SAMPLES)):

    text = sample["text"]

    true_original = label_names[sample["label"]]

    true_label = mapping[true_original]

    # Predict
    pred = classifier(text)

    if isinstance(pred, dict):
        predicted_label = pred["label"]
    elif isinstance(pred, list) and len(pred) > 0:
        if isinstance(pred[0], dict):
            predicted_label = pred[0]["label"]
        else:
            predicted_label = pred[0][0]["label"]
    else:
        raise ValueError(f"Unexpected prediction output format: {pred}")

    true_labels.append(true_label)
    pred_labels.append(predicted_label)

# =====================================================
# RESULTS
# =====================================================

accuracy = accuracy_score(true_labels, pred_labels)

print("\n========== RESULTS ==========")

print(f"\nAccuracy: {accuracy * 100:.2f}%")

print("\n========== CLASSIFICATION REPORT ==========")

print(
    classification_report(
        true_labels,
        pred_labels,
        zero_division=0
    )
)

print("\n========== CONFUSION MATRIX ==========")

labels = sorted(list(set(true_labels)))

print("Labels:", labels)

print(
    confusion_matrix(
        true_labels,
        pred_labels,
        labels=labels
    )
)