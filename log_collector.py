from db import get_db
from datetime import datetime

def collect_logs():
    logs = [
        ("auth" , "Failed login attempt") ,
        ("system" , "User 'admin' logged in") ,
        ("firewall" , "Port 80 blocked") ,
        ("auth" , "Password changed for user 'guest'") ,
        ("system" , "Service 'httpd' restarted") ,
        ("firewall" , "Port 22 blocked") ,
        ("auth" , "User 'guest' logged out") ,
        ("system" , "Service 'sshd' restarted") ,
        ("firewall" , "Port 443 blocked") ,
        ("auth" , "User 'admin' logged out")
    ]
    conn = get_db()
    for log in logs:
        conn.execute(
            "INSERT INTO logs (timestamp, source , message) VALUES (?, ?, ?)",
            (datetime.now(), log[0], log[1])

        )
    conn.commit()
    conn.close()
    print("Logs inserted!")

if __name__ == "__main__":
    collect_logs()