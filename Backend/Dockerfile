# Use official lightweight Python image
FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable bufferless logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the container workspace
WORKDIR /app

# Install system utilities needed for potential library building
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend source files
COPY . /app/

# Expose FastAPI backend API port
EXPOSE 8000

# Run FastAPI with live reload parameters
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
