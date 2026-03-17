#!/bin/bash

# Navigate to the project directory
cd "/Users/ssjoy/Desktop/joy workplace/react native/communication-app"

# Build Android development app
echo "🚀 Starting EAS build for Android..."
npx eas build --platform android --profile development --non-interactive --json 2>&1
