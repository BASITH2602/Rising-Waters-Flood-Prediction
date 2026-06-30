import sqlite3

conn = sqlite3.connect("prediction_history.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    probability REAL,
    risk TEXT
)
""")

conn.commit()
conn.close()

print("Database created successfully.")