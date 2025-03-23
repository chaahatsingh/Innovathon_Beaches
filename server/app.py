from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import re

app = Flask(__name__)
CORS(app)

# Load the model and vectorizer
try:
    model = joblib.load('spam_model.pkl')
    vectorizer = joblib.load('vectorizer.pkl')
except:
    # If model doesn't exist, create a simple dummy model
    from sklearn.naive_bayes import MultinomialNB
    
    # Sample training data
    X_train = [
        "Get rich quick! Buy now!",
        "Claim your prize money",
        "Meeting at 3pm tomorrow",
        "Project deadline reminder",
        "Free money waiting for you",
        "Your package has been delivered",
        "Wire transfer request urgent",
        "Team lunch next week",
        "Congratulations you won lottery",
        "Interview scheduled for Monday"
    ]
    y_train = [1, 1, 0, 0, 1, 0, 1, 0, 1, 0]  # 1 for spam, 0 for ham
    
    # Create and train vectorizer
    vectorizer = TfidfVectorizer(stop_words='english')
    X_train_vec = vectorizer.fit_transform(X_train)
    
    # Train model
    model = MultinomialNB()
    model.fit(X_train_vec, y_train)
    
    # Save model and vectorizer
    joblib.dump(model, 'spam_model.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')

def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
        
        # Preprocess the message
        message = preprocess_text(data['message'])
        
        # Vectorize the message
        message_vec = vectorizer.transform([message])
        
        # Make prediction
        prediction = model.predict(message_vec)[0]
        probability = np.max(model.predict_proba(message_vec)[0])
        
        # Format response
        result = {
            'classification': 'Spam' if prediction == 1 else 'Ham',
            'similarity_score': float(probability)
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
