# AI-Driven Analysis of Writing Samples for Early Detection of Dementia with EarlyTrace.ai

## Overview

This project utilizes **BGE-large-en-v1.5** for embedding generation and **XGBoost** for classification to predict the likelihood of dementia based on writing samples. The backend is built using **FastAPI**, and the frontend is developed in **React Native** with multi-screen navigation and data visualization.

---

## **Backend Functionality**

### Features
1. **Embedding Generation**:
   - Uses `BGE-large-en-v1.5` from **SentenceTransformers** to convert text into dense numerical vectors for downstream analysis.

2. **Classification**:
   - Predicts the likelihood of dementia using **XGBoost**, a Gradient Boosted Decision Trees model.

3. **API Endpoint**:
   - **POST /process**:
     - Accepts `input_text` as a string.
     - Returns:
       - **Result**: `DEMENTIA` or `NO_DEMENTIA`.
       - **Probabilities**: Confidence scores for dementia and non-dementia predictions.

4. **CORS Middleware**:
   - Ensures compatibility with frontend requests, allowing communication between different origins.

5. **Error Handling**:
   - Returns structured error responses for invalid inputs or system errors.

---

## **Running the Backend Locally**

### Prerequisites
- **Python 3.8+**
- **pip** (Python package installer)
- Required libraries:
  ```sh
  pip install fastapi xgboost joblib sentence-transformers uvicorn flask-cors

