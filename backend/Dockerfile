FROM node:20-bookworm-slim

# Install Python and other dependencies for Docling
# libgl1 and libglib2.0 are often required by AI/ML libraries for image/PDF processing
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies
# Using --break-system-packages for simplicity in a container environment, 
# or you could use a venv.
COPY python_scripts/requirements.txt ./python_scripts/
RUN pip3 install --no-cache-dir -r ./python_scripts/requirements.txt --break-system-packages

# Copy and install Node dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
