import subprocess
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent

print("Starting Node.js Express server...")
print("Backend API running on http://0.0.0.0:8001")

try:
    subprocess.run(["node", str(ROOT_DIR / "server.js")], cwd=str(ROOT_DIR), check=True)
except KeyboardInterrupt:
    print("\nShutting down...")
    sys.exit(0)
except Exception as e:
    print(f"Error starting Node.js server: {e}")
    sys.exit(1)