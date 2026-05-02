from db import get_db

def analyze_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM logs")
    logs = cursor.fetchall()
    for log in logs:
        message = log[3]
        score = 0 
        if "Failed login" in message:
            score += 5
        if "Password changed" in message:
            score += 2
        if "Service restarted" in message:
            score += 1
        if "Port blocked" in message:
            score += 3
        if "User logged in" in message:
            score += 1
        if "User logged out" in message:
            score += 1
        if score > 5:
            print(f"Alert: High risk log found! {log}")
    conn.commit()
    conn.close()
    return logs

if __name__ == "__main__":
    logs = analyze_logs()
    