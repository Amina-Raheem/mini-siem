from db import get_db

conn = get_db()
conn.execute("""
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME,
    source TEXT,
    message TEXT
)
""")
conn.commit()
conn.close()
print("Database initialized!")