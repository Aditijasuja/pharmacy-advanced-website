import subprocess
import sys
import os
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).parent

# Kill any existing node processes
try:
    subprocess.run(["pkill", "-f", "node server.js"], check=False)
except:
    pass

print("Starting Node.js Express server...")
print("Backend API running on http://0.0.0.0:8001")

process = None

def signal_handler(sig, frame):
    global process
    print("\nShutting down...")
    if process:
        process.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

try:
    process = subprocess.Popen(
        ["node", str(ROOT_DIR / "server.js")],
        cwd=str(ROOT_DIR),
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    process.wait()
except Exception as e:
    print(f"Error starting Node.js server: {e}")
    sys.exit(1)