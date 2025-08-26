#!/bin/bash
set -e

cd /home/ubuntu/app

echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 775727899931.dkr.ecr.ap-south-1.amazonaws.com

echo "Pulling latest Docker image..."
docker pull 775727899931.dkr.ecr.ap-south-1.amazonaws.com/djjsfrontend:latest

echo "Stopping old container..."
docker stop djjsfrontend || true
docker rm djjsfrontend || true
