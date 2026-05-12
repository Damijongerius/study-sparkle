# Use NVIDIA CUDA as the base image
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

# Install Node.js 20 and Python dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies
# Increased timeout for large AI library downloads
COPY python_scripts/requirements.txt ./python_scripts/
RUN pip3 install --no-cache-dir --default-timeout=1000 torch --index-url https://download.pytorch.org/whl/cu121
RUN pip3 install --no-cache-dir --default-timeout=1000 -r ./python_scripts/requirements.txt

# Copy and install Node dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
