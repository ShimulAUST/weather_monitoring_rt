FROM python:3.9
ENV PYTHONUNBUFFERED=1
WORKDIR /backend

RUN pip install --upgrade pip 

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3-dev \
    pkg-config \
    build-essential \
    default-libmysqlclient-dev \
    nano\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt -v


COPY . /backend/