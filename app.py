from flask import Flask, render_template
from db import get_db

# ✅ STEP 1: create app FIRST
app = Flask(__name__)

# ✅ STEP 2: define routes AFTER app
@app.route("/")
def index():
    conn = get_db()
    logs = conn.execute("SELECT * FROM logs").fetchall()
    conn.close()
    return render_template("dashboard.html", logs=logs)

# ✅ STEP 3: run app
if __name__ == "__main__":
    app.run(debug=True)