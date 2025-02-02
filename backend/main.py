from fastapi import FastAPI, HTTPException
import xgboost as xgb
import joblib
from sentence_transformers import SentenceTransformer

app = FastAPI(swagger_ui_parameters={"syntaxHighlight.theme": "obsidian"})

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
            "prob_dementia": f"{prediction[0][1]:.4f}",
            "prob_no_dementia": f"{prediction[0][0]:.4f}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
