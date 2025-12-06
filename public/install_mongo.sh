#!/bin/bash
# ----------------------------------------------------------------------
# Adorio Space - MongoDB 8.0 Installer
# ----------------------------------------------------------------------

cat << "EOF"
    ___       __          _      
   /   | ____/ /___  ____(_)___  
  / /| |/ __  / __ \/ __/ / __ \ 
 / ___ / /_/ / /_/ / / / / /_/ / 
/_/  |_\__,_/\____/_/ /_/\____/  
         _________  ____  ________
        / ___/ __ \/ __ `/ ___/ _ \
       (__  ) /_/ / /_/ / /__/ __/
       /____/ .___/\__,_/\___/\___/ 
           /_/                    
EOF

set -e

# --- Configuration ---
MONGO_VERSION="8.0"

# --- Confirmation ---
echo ""
echo "(!) WARNING: This will WIPE all existing MongoDB data (/var/lib/mongodb) and configurations."
echo "    It will then install MongoDB Community Server $MONGO_VERSION." # Cleaned up spacing
echo ""
# FIX: Redirect read to /dev/tty to ensure input works when running via 'curl | bash'
read -p "Are you sure you want to proceed? [y/N] " -n 1 -r </dev/tty
echo "" # Ensures a clean newline after user input
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# --- Cleanup ---
echo "---  Cleaning up old installations  ---"
sudo systemctl stop mongod 2>/dev/null || true
sudo apt-get purge -y "mongodb-org*" 2>/dev/null || true
sudo rm -rf /var/log/mongodb /var/lib/mongodb
sudo rm -f /etc/apt/sources.list.d/mongodb-org-*.list

# --- OS Detection ---
echo "--- Detecting OS ---"
if command -v lsb_release >/dev/null; then
    OS_CODENAME=$(lsb_release -sc)
elif [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_CODENAME=$VERSION_CODENAME
else
    echo "Error: Could not detect OS codename."
    exit 1
fi
echo "Detected: $OS_CODENAME"

# --- Repository Setup ---
echo "--- Setting up Repositories ---"
sudo apt-get update -qq
sudo apt-get install -y gnupg curl

# Import GPG Key
curl -fsSL https://www.mongodb.org/static/pgp/server-${MONGO_VERSION}.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg --dearmor --yes

# Add to sources list
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg ] https://repo.mongodb.org/apt/ubuntu ${OS_CODENAME}/mongodb-org/${MONGO_VERSION} multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list > /dev/null

sudo apt-get update -qq

# --- Installation ---
echo "--- Installing MongoDB $MONGO_VERSION ---"
sudo apt-get install -y mongodb-org

# --- Service Start ---
echo "--- Starting Service ---"
sudo systemctl daemon-reload
sudo systemctl start mongod
sudo systemctl enable mongod

echo ""
echo "Done. Status:"
sudo systemctl status mongod --no-pager | grep "Active:"
echo ""
echo "Connect with: mongosh"