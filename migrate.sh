#!/bin/bash

# Migration helper script for What-To-Eat application
# This script builds and runs the migration container to execute EF Core commands

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

IMAGE_NAME="whattoeat-migrations"
NETWORK_NAME="${DOCKER_NETWORK:-what-to-eat_default}"

echo -e "${BLUE}Building migration Docker image...${NC}"
docker build -f Dockerfile.migrations -t $IMAGE_NAME .

# Get the connection string from environment or use default
CONNECTION_STRING="${DATABASE_URL:-Host=postgres;Port=5432;Database=whattoeat;Username=postgres;Password=postgres}"

# Determine the directory name for default network
DIR_NAME=$(basename "$(pwd)")
DETECTED_NETWORK="${DIR_NAME}_default"

# Try to detect if the network exists
if docker network inspect "$DETECTED_NETWORK" >/dev/null 2>&1; then
    NETWORK_NAME="$DETECTED_NETWORK"
fi

if [ $# -eq 0 ]; then
    echo -e "${YELLOW}No command provided. Showing help:${NC}"
    docker run --rm --network "$NETWORK_NAME" $IMAGE_NAME --help
else
    echo -e "${GREEN}Running: dotnet ef $@${NC}"
    echo -e "${BLUE}Using network: $NETWORK_NAME${NC}"
    docker run --rm \
        --network "$NETWORK_NAME" \
        -e ConnectionStrings__DefaultConnection="$CONNECTION_STRING" \
        $IMAGE_NAME "$@"
fi

echo -e "${GREEN}Done!${NC}"
