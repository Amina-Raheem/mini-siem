from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime

api = Blueprint('api', __name__)

@api.route('/log', methods=['POST'])
def add_log():
    data = request.json or {}
    source = data.get("source", "unknown")
    message = data.get("message", "")

    conn = get_db()
    conn.execute(
        "INSERT INTO logs (timestamp, source, message) VALUES (?, ?, ?)",
        (datetime.now(), source, message)
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "log added"})