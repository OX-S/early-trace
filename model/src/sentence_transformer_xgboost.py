import json
import re
import xgboost as xgb
import joblib
from lime.lime_text import LimeTextExplainer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sentence_transformers import SentenceTransformer
import numpy as np


def load_from_json(file_paths):
    all_data = []
    for file_path in file_paths:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_data.extend(data)
    return all_data


def prepare(dementia_files, non_dementia_files):
    dementia_data = load_from_json(dementia_files)
    non_dementia_data = load_from_json(non_dementia_files)

    # dementia as 1, no dementia as 0
    texts = []
    labels = []

    with open('stopwords.txt', 'r', encoding='utf-8') as f:
        stopwords = {line.strip().lower() for line in f if line.strip()}
        print(stopwords)

    def remove_stopwords(text: str, stopwords: set) -> str:
        tokens = text.split()
        filtered_tokens = []

        for t in tokens:
            lower_token = t.lower()
            cleaned_lower_token = re.sub(r'[\W_]+', '', lower_token)

            if any(sw in cleaned_lower_token for sw in stopwords):
                continue
            else:
                filtered_tokens.append(t)

        return " ".join(filtered_tokens)

    for post in dementia_data:
        original_content = post["content"]
        cleaned_content = remove_stopwords(original_content, stopwords)
        texts.append(cleaned_content)
        labels.append(1)  # dementia = 1

    for post in non_dementia_data:
        original_content = post["content"]
        cleaned_content = remove_stopwords(original_content, stopwords)
        texts.append(cleaned_content)
        labels.append(0)  # no dementia = 0

    return texts, labels


category_mapping = {
    'NO_DEMENTIA': 0,
    'DEMENTIA': 1,
}

def main(prediction_proba=None):
    dementia_files = [
        "data/experimental/ken-kenc2.blogspot.com/final_raw_posts.json",
        "data/experimental/creatingmemories.blogspot.com/final_raw_posts.json",
        "data/experimental/georgerook51.wordpress.com/final_raw_posts.json",
    ]
    non_dementia_files = [
        "data/control/journeywithdementia.blogspot.com/final_raw_posts.json",
        "data/control/helpparentsagewell.blogspot.com/final_raw_posts.json",
        "data/control/taosecurity.blogspot.com/final_raw_posts.json",
        'data/control/peaceofmindalz.blogspot.com/final_raw_posts.json',
        'data/control/lewybodydementia.blogspot.com/final_raw_posts.json'
    ]

    X, y = prepare(dementia_files, non_dementia_files)

    model = SentenceTransformer('BAAI/bge-large-zh-v1.5')
    # embeddings = model.encode(X, normalize_embeddings=True)

    # all_embeddings = np.array(embeddings)
    # np.save('embeddings_v1.4_large_stopwords.npy', all_embeddings)
    np_embeddings = np.load('embeddings_v1.4_large_stopwords.npy')
    #
    X_train, X_test, y_train, y_test = train_test_split(np_embeddings, y,
                                                        test_size=0.2,
                                                        random_state=35,
                                                        stratify=y)

    classifier = xgb.XGBClassifier()
    classifier.fit(X_train, y_train)

    # classifier.save_model('xgboost_model_v1.1.model')

    joblib.dump(classifier, 'xgboost_model_v1.2.json')

    # classifier = joblib.load('xgboost_model.json')

    predictions = classifier.predict(X_test)
    #
    accuracy = accuracy_score(y_test, predictions)
    print("Accuracy:", accuracy)
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    # cm = confusion_matrix(y_test, y_pred)
    # plt.figure(figsize=(10, 7))
    # sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=category_mapping.keys(), yticklabels=category_mapping.keys())

    # plt.xlabel('Predicted')
    # plt.ylabel('Actual')
    # plt.title('Confusion Matrix')

    class_names = ["NO_DEMENTIA", "DEMENTIA"]
    explainer = LimeTextExplainer(class_names=class_names)


    def lime_predict(texts):

        embedded_text = model.encode(texts)
        return classifier.predict_proba(embedded_text)

    # a = "Dementia is a syndrome associated with many neurodegenerative diseases, characterized by a general decline in cognitive abilities that affects a person's ability to perform everyday activities. This typically involves problems with memory, thinking, behavior, and motor control.[10] Aside from memory impairment and a disruption in thought patterns, the most common symptoms of dementia include emotional problems, difficulties with language, and decreased motivation.[2] The symptoms may be described as occurring in a continuum over several stages.[11][a] Dementia ultimately has a significant effect on the individual, their caregivers, and their social relationships in general.[2] A diagnosis of dementia requires the observation of a change from a person's usual mental functioning and a greater cognitive decline than might be caused by the normal aging process.[13]"
    # a = "I'm working hard on developing a couple of presentations for the Dementia Alliance Zoom Conference on Managing Dementia-Related Behaviors on the 10th and 11th of this month. Be sure to register even if you can't attend live. All registrants will receive instructions for accessing the recorded sessions and handouts with some good references. The advantage of attending live is that we will have a panel session where you can ask us questions, but if you can't be there you can still get the benefit of what others ask and listen to the recorded presentations. See my 1-22-21 blog for more information about this free conference. With Pat Snyder and Dr. Trey Bateman and myself as speakers, it should be a conference worth attending...especially when you can do it at your leisure by registering and obtaining the recordings and handouts. I'd recommend both...attend as much of the two days live as you can and catch up with anything that  you missed later when you view the recordings. Oh, and did I mention that it is FREE? In the meantime, I probably will not be blogging until the 19th. For more information about Lewy body disorders, read our books A Caregivers’ Guide to Lewy Body Dementia Managing Cognitive Issues in Parkinson's and Lewy Body Dementia Responsive Dementia Care: Fewer Behaviors Fewer Drugs Lewy Body Dementia: A Manual for Staff Helen and James Whitworth are not doctors, lawyers or social workers. As informed caregivers, they share the information here for educational purposes only. It should never be used instead of a professional's advice."
    a = "This was posted on Facebook by a man in his mid-70’s. I think caregivers might be able to take some of his ideas to heart as well! I've added some comments to each one. After loving my parents, my siblings, my spouse, my children and my friends, I have now started loving myself. (So easy to forget when you are so involved with providing care, but it is a MUST DO for healthy, safe caregiving!) I have realized that I am not “Atlas”. The world does not rest on my shoulders. (And I don't have to be perfect either!) I stopped telling the elderly (anyone!) that they've already narrated that story many times. The story makes them walk down memory lane & relive their past. (Ah, yes, reminiscing is a great mind exercise!) I have learned not to correct people even when I know they are wrong. The onus of making everyone perfect is not on me. Peace is more precious than perfection. (This is one that LBD care partners must practice often with their loved ones with a different reality. We say Do you want to be right or do you want to be peaceful?) I give compliments freely & generously. Compliments are a mood enhancer not only for the recipient, but also for me. And a small tip for the recipient of a compliment, never, NEVER turn it down, just say Thank You.” (This is another one that care partners can practice often for wonderful results.) I have learned not to bother about a crease or a spot on my shirt. Personality speaks louder than appearances. (Perfection again, and how it isn't all that helpful!) I walk away from people who don't value me. They might not know my worth, but I do. (This can work with a contankorous loved one too. Walk away and return and usually the air will have cleared!) I remain cool when someone plays dirty to outrun me in the rat race. I am not a rat & neither am I in any race. (When your loved one accuses you of something you didn't do, speak to their emotions  in their reality and apologize. But then, let it go--don't own the hurt of their accusation.) I am learning not to be embarrassed by my emotions. It’s my emotions that make me human. (Caregiving is stressful and emotions often come to the surface. Let them come--but choose to express the negative ones away from your loved one unless you want them tossed back at you three-fold!) I have learned that it's better to drop the ego than to break a relationship. My ego will keep me aloof, whereas with relationships, I will never be alone. (Caregivers learn to do this when we drop our need to be right and accept our loved one's reality as the only one where we can communicate. I have learned to live each day as if it's the last. After all, it might be the last. (We know this better than most!) I am doing what makes me happy. I am responsible for my happiness, and I owe it to myself. Happiness is a choice. You can be happy at any time, just choose to be! (Caregiving may not have been what you would have chosen to make you happy, but you CAN choose to be happy and to find little things to be grateful for each day.)"

    # exp = explainer.explain_instance(
    #     a,
    #     lime_predict,
    #     num_features=10,  # how many words (features) you want to highlight
    #     num_samples=1000  # how many perturbations LIME will create
    # )

    # exp.show_in_notebook(text=True)
    # html_explanation = exp.as_html()
    # with open("lime_explanation.html", "w") as f:
    #     f.write(html_explanation)

    # example_text_tfidf = vectorizer.transform(a)
    # prediction = classifier.predict(example_text_tfidf)
    # prediction_proba = classifier.predict_proba(example_text_tfidf)

    new_embeddings = model.encode([a])
    prediction = classifier.predict_proba(new_embeddings)
    #
    # print(f"\nSample text: {a[0]}")
    # # print("Predicted Class:", "Dementia" if prediction[0] == 1 else "Non-Dementia", )
    print(f"Probability of Dementia: {prediction}")
    #
    # print(f"Probability of Non-Dementia: {prediction_proba[0][0]:.4f}")
    #
    # plt.show()


if __name__ == "__main__":
    main()
