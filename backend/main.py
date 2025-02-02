from fastapi import FastAPI, HTTPException
from flask_cors import CORS

import xgboost as xgb
import joblib
from sentence_transformers import SentenceTransformer
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(swagger_ui_parameters={"syntaxHighlight.theme": "obsidian"})

origins = [
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


xgb_classifier = joblib.load('../model/xgboost_model.json')
model = SentenceTransformer('BAAI/bge-large-zh-v1.5')


@app.post("/process", status_code=200)
async def process_input(input_text: str):
    if not input_text:
        raise HTTPException(status_code=500, detail="Input text cannot be empty.")

    try:

        new_embeddings = model.encode([input_text])
        prediction = xgb_classifier.predict_proba(new_embeddings)

        return {
            "result": "DEMENTIA" if prediction[0][1] > prediction[0][0] else "NO_DEMENTIA",
            "prob_dementia": float(f"{prediction[0][1]:.4f}"),
            "prob_no_dementia": float(f"{prediction[0][0]:.4f}")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
