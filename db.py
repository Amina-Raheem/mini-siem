import sqlite3
def get_db():
    # Adding timeout=10 helps prevent "database is locked" OperationalErrors 
    # when syslog_server, api, and app read/write at the same time.
    conn = sqlite3.connect("logs.db", timeout=10)
    return conn