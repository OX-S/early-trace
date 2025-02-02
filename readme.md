# EarlyTrace.ai  
**AI-Driven Analysis for Early Dementia Detection**

EarlyTrace.ai leverages advanced machine learning to analyze writing samples, identifying cognitive changes linked to dementia. Our research builds upon insights from Asllani & Mullen (2023), which demonstrated that personal writings could reveal early dementia indicators.

## Key Findings
- ✅ Decreased Authenticity & Emotional Tone
- ✅ Reduced Use of Functional Words (e.g., grammar, conjunctions, articles)
- ✅ Lower Frequency of Emotional Words (happiness, sadness, anger)
- ✅ Higher Pronoun Usage (e.g., “I,” “they”)
- ✅ Fewer Time-Oriented Words (past, present, future references)

## Data & Preprocessing
- ✔ HTML & character cleaning
- ✔ Filtering out links & reposts
- ✔ Tokenization & stopword removal

## Model Architecture
### 🔹 Embedding Generation:
BGE-large-en-v1.5 converts text into dense numerical vectors for analysis.

### 🔹 Classification:
XGBoost (Gradient Boosted Decision Trees) powers our classification model, providing high accuracy and scalability.

## Feature Refinement
- ✔ Used LimeTextExplainer to identify high-impact words affecting predictions
- ✔ Removed words that were topic-specific rather than cognitive indicators

## Research Team
- 🧑‍🔬 Finn Kliewer
- 🧑‍💻 Ben Plaksienko
- 📊 Alex Rasevych

### 📅 February 2, 2025

## References
- 📖 Asllani B, Mullen DM (2023). Using personal writings to detect dementia: A text mining approach.
- 🔗 NVIDIA (2025). [What is XGBoost? Learn More](https://www.nvidia.com/en-us/)
