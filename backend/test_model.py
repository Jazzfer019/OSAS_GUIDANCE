# 1️⃣ Import packages
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB  # Naive Bayes classifier
from sklearn.metrics import accuracy_score, confusion_matrix
import joblib
import string
import numpy as np

# 2️⃣ Load dataset
df = pd.read_excel(r"C:\Users\Harold Arevalo\Downloads\cvsu_violation_cleaned_no_violation_final_3883_rows.xlsx")
texts = df['text']
labels = df['violation']
sections = df['section']  # Extract section column

# 3️⃣ Check dataset
print("Dataset preview:")
print(df.head())
print(f"Total rows: {df.shape[0]}\n")

# 4️⃣ Preprocessing
def preprocess(text):
    """Lowercase and remove punctuation"""
    return text.lower().translate(str.maketrans('', '', string.punctuation))

texts = texts.apply(preprocess)

# 5️⃣ Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.2, random_state=42
)

# 6️⃣ TF-IDF Vectorizer
vectorizer = TfidfVectorizer()
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# 7️⃣ Train Naive Bayes Model
model = MultinomialNB()  # Using Naive Bayes
model.fit(X_train_tfidf, y_train)

# 8️⃣ Evaluation
y_pred = model.predict(X_test_tfidf)
accuracy = accuracy_score(y_test, y_pred)
print(f"Test Accuracy: {accuracy:.2f}")

cm = confusion_matrix(y_test, y_pred)
print("Confusion Matrix:")
print(cm)

# 9️⃣ Save model + vectorizer
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
print("✅ Model and vectorizer saved successfully!")

# 🔟 Save violation → section mapping
violation_to_section = dict(zip(df['violation'], df['section']))
joblib.dump(violation_to_section, "violation_to_section.pkl")
print("✅ Violation → Section mapping saved successfully!")

# 1️⃣1️⃣ Save violation → standard text
# Get FIRST example text for each violation
violation_to_standard_text = (
    df.groupby("violation")["text"].first().to_dict()
)

joblib.dump(violation_to_standard_text, "violation_to_standard_text.pkl")
print("✅ Violation → Standard Text mapping saved successfully!")

# 1️⃣2️⃣ Prediction Function
def predict_violation(sentence, top_n=3):
    sentence_proc = preprocess(sentence)
    vectorized = vectorizer.transform([sentence_proc])
    pred = model.predict(vectorized)[0]

    # Predictive text (top N)
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(vectorized)[0]
        classes = model.classes_
        top_indices = np.argsort(probs)[::-1][:top_n]
        predictive_text = ", ".join([f"{classes[i]} ({probs[i]*100:.1f}%)" for i in top_indices])
    else:
        predictive_text = pred

    predicted_section = violation_to_section.get(pred, "Unknown")
    standard_text = violation_to_standard_text.get(pred, "No sample text available")

    return {
        "input_text": sentence,
        "predicted_violation": pred,
        "predicted_section": predicted_section,
        "predictive_text": predictive_text,
        "standard_text": standard_text
    }

# 🔁 Test predictive function
test_sentences = [
    "Binato ang bintana sa classroom",
    "Student copied answers from classmate",
    "Uminom sa loob ng classroom"
]

for s in test_sentences:
    print(predict_violation(s))
