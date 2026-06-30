from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import sqlite3
from datetime import datetime

app = Flask(__name__)

import sqlite3

def init_db():
    conn = sqlite3.connect("prediction_history.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        probability REAL,
        risk TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

# Load trained model and scaler
model = joblib.load("model/best_model.pkl")
scaler = joblib.load("model/scaler.pkl")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    try:

        values = [
            float(request.form["MonsoonIntensity"]),
            float(request.form["TopographyDrainage"]),
            float(request.form["RiverManagement"]),
            float(request.form["Deforestation"]),
            float(request.form["Urbanization"]),
            float(request.form["ClimateChange"]),
            float(request.form["DamsQuality"]),
            float(request.form["Siltation"]),
            float(request.form["AgriculturalPractices"]),
            float(request.form["Encroachments"]),
            float(request.form["IneffectiveDisasterPreparedness"]),
            float(request.form["DrainageSystems"]),
            float(request.form["CoastalVulnerability"]),
            float(request.form["Landslides"]),
            float(request.form["Watersheds"]),
            float(request.form["DeterioratingInfrastructure"]),
            float(request.form["PopulationScore"]),
            float(request.form["WetlandLoss"]),
            float(request.form["InadequatePlanning"]),
            float(request.form["PoliticalFactors"])
        ]

        data = np.array(values).reshape(1, -1)

        data = scaler.transform(data)

        prediction = float(model.predict(data)[0])

        # Risk Level
        if prediction < 0.30:
            risk = "Low"
            advice = [
                "🌤 Normal flood conditions.",
                "📡 Stay updated with weather forecasts.",
                "🛠 Maintain drainage around your home."
            ]

        elif prediction < 0.70:
            risk = "Moderate"
            advice = [
                "🌧 Monitor rainfall regularly.",
                "🎒 Prepare an emergency kit.",
                "🚧 Avoid travelling through low-lying areas."
            ]

        else:
            risk = "High"
            advice = [
                "🏃 Move to higher ground if necessary.",
                "📞 Keep emergency contacts ready.",
                "🚫 Avoid flooded roads and rivers.",
                "📢 Follow official evacuation instructions."
            ]

        # Save prediction to database
        conn = sqlite3.connect("prediction_history.db")
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO history(date, probability, risk)
        VALUES (?, ?, ?)
        """, (
            datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            round(prediction, 4),
            risk
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "prediction": round(prediction, 4),
            "risk": risk,
            "advice": advice
        })

    except Exception as e:
        print(e)

        return jsonify({
            "error": str(e)
        }), 500
    

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)