import socket
from db import get_db
from datetime import datetime

def start_syslog_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("127.0.0.1", 5140))   # safer for local

    print("Syslog server running on port 5140...")

    while True:
        try:
            data, addr = sock.recvfrom(1024)
            message = data.decode('utf-8', errors='ignore')

            conn = get_db()
            conn.execute(
                "INSERT INTO logs (timestamp, source, message) VALUES (?, ?, ?)",
                (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), "syslog", message)
            )
            conn.commit()
            conn.close()

            print(f"Received from {addr}: {message}")

        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    start_syslog_server()