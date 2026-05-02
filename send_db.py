import socket
print("Sending log...")
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
result = sock.sendto(b"HELLO123", ("127.0.0.1", 5140))
print("Bytes sent:", result)