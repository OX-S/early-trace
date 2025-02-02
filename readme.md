# EarlyTrace.ai  
**AI-Driven Analysis for Early Dementia Detection**

Inspired by a 2023 Paper, **Using personal writings to detect dementia: A text mining approach [1]**, we trained an AI model to detect dementia in written texts quickly and efficiently. To do this, we first scrapped blog posts from people with and without dementia. From this, we got about 1.4 million tokens worth of training data. We then generated sentence embeddings using the BGE-large-en-v1.5 transformer model since it can run efficiently CPU only and ranks fairly high on the HuggingFace MTEB leaderboard, and the embedding dimensions of 1024 are large enough to capture the minor subtleties and nuances our texts. Sentence embeddings are a way to classify a text as a single vector. To classify the texts, we used gradient boosting with the XGBoost library to classify each text as either "likely dementia" or "not likely dementia." Out of our roughly 3000 training points, we set aside 20% for testing and validation. These training points were not used in the training of our model. We performed 5-fold cross-validation on our model, resulting in **an F1 score of 0.95 based on a total support of 606**.

## Model Architecture
### 🔹 Embedding Generation:
Used BGE-large-en-v1.5 to generate sentence embeddings at embedding dimensions of 1024 to capture all minor nuances.

### 🔹 Classification:
XGBoost (Gradient Boosted Decision Trees) powers our classification model, providing high accuracy and scalability [2].

## Feature Refinement
- ✔ Used LimeTextExplainer to identify high-impact words affecting predictions
- ✔ Removed words that were topic-specific rather than cognitive indicators

## Validation
- ✔ Model had not previously seen the validation set of data
- ✔ 5-fold cross-validation, resulting in **an F1 score of 0.95 based on a total support of 606**.


## Research Team
- 🧑‍🔬 Finn Kliewer (Cornell)
- 🧑‍💻 Ben Plaksienko (NJIT)
- 📊 Alex Rasevych (Rutgers)

### 📅 February 2, 2025

## References
- (1) 📖 Asllani B, Mullen DM (2023). Using personal writings to detect dementia: A text mining approach.
- (2) 🔗 NVIDIA (2025). [What is XGBoost? Learn More](https://www.nvidia.com/en-us/)
- (3) 🔗 https://docs.google.com/presentation/d/1jpBfdRao1OESWHJHArM3evJJBjT8VINasTR8f9SRLR0/edit?usp=sharing
