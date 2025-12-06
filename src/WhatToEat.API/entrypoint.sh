#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "Starting application..."
exec dotnet WhatToEat.API.dll
