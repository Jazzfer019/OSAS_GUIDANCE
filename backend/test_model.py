import joblib
import numpy as np
import string

# ---------- Load Saved Model Files ----------
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")
violation_to_section = joblib.load("violation_to_section.pkl")

# This may or may not exist depending on your files
try:
    violation_to_standard_text = joblib.load("violation_to_standard_text.pkl")
except:
    violation_to_standard_text = {}

# ---------- Preprocessing ----------
def preprocess(text):
    return text.lower().translate(str.maketrans('', '', string.punctuation))


# ---------- Example Test Sentences ----------
test_sentences = [
    "Binato ang bintana sa classroom",
    "Student copied answers from classmate",
    "Uminom sa loob ng classroom"
]


# ---------- Prediction Loop ----------
for sentence in test_sentences:

    # Preprocess input
    processed = preprocess(sentence)
    vectorized = vectorizer.transform([processed])
    
    # Main prediction
    predicted_violation = model.predict(vectorized)[0]
    predicted_section = violation_to_section.get(predicted_violation, "Unknown")

    # ---------- TOP 3 PREDICTIVE TEXT ----------
    try:
        probs = model.predict_proba(vectorized)[0]
        classes = model.classes_

        top_idx = np.argsort(probs)[::-1][:3]

        predictive_text = ", ".join([
            f"{classes[i]} ({probs[i]*100:.1f}%)"
            for i in top_idx
        ])
    except:
        predictive_text = predicted_violation

    # ---------- Get Standard Text from Dataset ----------
    standard_text = violation_to_standard_text.get(
        predicted_violation,
        "No standard text available"
    )

    # ---------- OUTPUT ----------
    print(f"Input: {sentence}")
    print(f"Predicted Violation: {predicted_violation}")
    print(f"Predicted Section: {predicted_section}")
    print(f"Predictive Text (Top 3): {predictive_text}")
    print(f"Standard Dataset Text: {standard_text}\n")
