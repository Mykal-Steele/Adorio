#!/bin/bash
# ----------------------------------------------------------------------
# MongoDB Community Edition Installation Script for WSL/Ubuntu
# Installs: MongoDB Server (mongod) and Shell (mongosh)
# Version: 7.0
# Method: Uses modern, non-deprecated apt methods.
# ----------------------------------------------------------------------

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- 🧹 Starting MongoDB Cleanup (Phase 1) ---"

# Stop the MongoDB service if it is running
echo "Attempting to stop mongod service..."
sudo systemctl stop mongod || true

# Remove all official MongoDB packages
echo "Removing previously installed MongoDB packages..."
sudo apt-get purge -y "mongodb-org*" || true

# Remove MongoDB databases and log files
echo "Removing data and log directories..."
sudo rm -rf /var/log/mongodb /var/lib/mongodb

# Remove the old source list file if it exists
echo "Cleaning up repository source files..."
sudo rm -f /etc/apt/sources.list.d/mongodb-org-7.0.list

echo "Cleanup complete. Starting installation."

# --- Installation Variables ---
MONGO_VERSION="7.0"
# Automatically detect Ubuntu version code (e.g., jammy, focal)
UBUNTU_CODENAME=$(lsb_release -sc)

echo "Detected Ubuntu Codename: ${UBUNTU_CODENAME}"

echo "--- 🔑 Phase 2: Key Import (Non-Deprecated Method) ---"

# Install prerequisites
echo "Installing gnupg and curl prerequisites..."
sudo apt-get update
sudo apt-get install -y gnupg curl

# Import the MongoDB public GPG key securely
echo "Importing MongoDB public GPG key..."
curl -fsSL https://www.mongodb.org/static/pgp/server-${MONGO_VERSION}.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg --dearmor

echo "--- 📝 Phase 3: Repository Setup ---"

# Create the list file using the auto-detected codename and secure key reference
echo "Creating the apt repository list file..."
REPO_LINE="deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/${MONGO_VERSION} multiverse"
echo ${REPO_LINE} | sudo tee /etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list

# Reload the local package database
echo "Reloading the package database..."
sudo apt update

echo "--- 📦 Phase 4: Install MongoDB Server & Shell ---"

# Install the mongodb-org metapackage (includes server and mongosh)
echo "Installing mongodb-org (Server and Shell)..."
sudo apt-get install -y mongodb-org

echo "--- ⚙️ Phase 5: Start Service ---"

# Ensure systemd knows about the new service
sudo systemctl daemon-reload

# Start MongoDB service
echo "Starting the MongoDB database service (mongod)..."
sudo systemctl start mongod

# Enable MongoDB to start on boot (optional, but good practice)
sudo systemctl enable mongod

echo "--- ✅ Installation Complete! ---"
echo " "
echo "To check the status of the MongoDB server:"
echo "  sudo systemctl status mongod"
echo " "
echo "To connect to the database shell:"
echo "  mongosh"
echo " "