"""
Evaluation on Frozen Test Set (24 handcrafted independent samples).
This test set is NEVER used for training or threshold tuning.
Measures Precision, Recall, and Confusion Matrix.
"""

import os
import sys
import json
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from classifier import SocialEngineeringClassifier

FROZEN_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "frozen_test_set.json")

classifier = SocialEngineeringClassifier()
classifier.train()



def load_frozen_dataset():
    with open(FROZEN_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_frozen_dataset_evaluation():
    data = load_frozen_dataset()
    assert len(data) >= 20, "Le jeu de test gelé doit contenir au moins 20 messages."

    y_true = []
    y_pred = []
    results_detail = []

    for item in data:
        text = item["text"]
        true_label = item["label"]  # 1 = scam, 0 = legit
        prediction = classifier.predict(text)
        risk_level = prediction["risk_level"]

        # Classification decision: MODERE, ELEVE, CRITIQUE are flagged as threat (1), FAIBLE as safe (0)
        pred_label = 1 if risk_level in ["MODERE", "ELEVE", "CRITIQUE"] else 0

        y_true.append(true_label)
        y_pred.append(pred_label)

        results_detail.append({
            "id": item["id"],
            "language": item["language"],
            "true": true_label,
            "pred": pred_label,
            "risk_level": risk_level,
            "text": text[:60] + "..."
        })

    # Compute Confusion Matrix
    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    tn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / len(y_true)

    report = (
        f"\n=======================================================\n"
        f"RÉSULTATS DE L'ÉVALUATION SUR LE JEU GELÉ (N={len(data)})\n"
        f"(Données écrites à la main, indépendantes de l'entraînement)\n"
        f"=======================================================\n"
        f"Vrais Positifs (TP)  : {tp} / {tp + fn}\n"
        f"Vrais Négatifs (TN)  : {tn} / {tn + fp}\n"
        f"Faux Positifs  (FP)  : {fp} / {tn + fp}\n"
        f"Faux Négatifs  (FN)  : {fn} / {tp + fn}\n"
        f"-------------------------------------------------------\n"
        f"Précision           : {precision:.4f} ({precision * 100:.1f} %)\n"
        f"Rappel (Recall)     : {recall:.4f} ({recall * 100:.1f} %)\n"
        f"F1-Score            : {f1:.4f}\n"
        f"Exactitude (Accuracy): {accuracy:.4f} ({accuracy * 100:.1f} %)\n"
        f"-------------------------------------------------------\n"
        f"Matrice de Confusion :\n"
        f"                  Prédit Légitime    Prédit Arnaque\n"
        f"  Réel Légitime       TN = {tn:2d}           FP = {fp:2d}\n"
        f"  Réel Arnaque        FN = {fn:2d}           TP = {tp:2d}\n"
        f"=======================================================\n"
    )

    print(report)

    # Sanity checks on dataset integrity
    assert len(data) == 24
    assert (tp + fn) == 12  # 12 real scams
    assert (tn + fp) == 12  # 12 real legitimate messages
    assert tp > 0
    assert tn > 0



if __name__ == "__main__":
    test_frozen_dataset_evaluation()
