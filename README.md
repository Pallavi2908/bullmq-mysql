# Introduction

This is a mini image compression service built using Express, BullMQ and Sharp (Node.js library for image compression).
This is the very heart of Nexus, which is built on this core structure.
BullMQ is used to set up a Queue which queues incoming Jobs (requests sent from Client side) and is off loaded by workers (which perform the compression task).

# Features

- Asynchronous image processing using BullMQ
- Redis-backed job queue
- Dynamic image resizing (no fixed width for all images)
- High-quality downscaling using mks2021 kernel
- Safe handling of network failures and retries

# Installation

- Node.js ≥ 18
- Docker
- Git

1. Clone the respository

```
git clone https://github.com/Pallavi2908/bullmq-mysql.git
```

2. Install dependencies

```
npm install
```

3. Start Redis using Docker

```
docker run -d --name <your_custom_name> -p 6379:6379 redis
```

If container already exists then simply start:

```
docker start <your_custom_name>
```

# 🛠️ Tech Stack

- Node.js
- Express
- BullMQ
- Redis
- Sharp
- Docker
