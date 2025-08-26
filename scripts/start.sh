#!/bin/bash
set -e

echo "Starting new container..."
docker run -d --name djjsfrontend -p 80:80 775727899931.dkr.ecr.ap-south-1.amazonaws.com/djjsfrontend:latest
