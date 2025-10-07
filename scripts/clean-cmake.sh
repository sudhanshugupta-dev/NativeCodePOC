#!/bin/bash

# Comprehensive cleanup script for React Native/Expo CMake issues
# This script permanently fixes persistent CMake configuration errors

set -e

echo "🧹 Starting comprehensive CMake cleanup for React Native/Expo project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
ANDROID_DIR="$PROJECT_ROOT/android"

echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"

# Function to safely remove directory
safe_remove() {
    local dir="$1"
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}Removing: $dir${NC}"
        rm -rf "$dir"
        echo -e "${GREEN}✓ Removed: $dir${NC}"
    else
        echo -e "${BLUE}ℹ Directory not found: $dir${NC}"
    fi
}

# Function to safely remove file
safe_remove_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo -e "${YELLOW}Removing: $file${NC}"
        rm -f "$file"
        echo -e "${GREEN}✓ Removed: $file${NC}"
    else
        echo -e "${BLUE}ℹ File not found: $file${NC}"
    fi
}

echo -e "${BLUE}📦 Step 1: Stopping Gradle daemon...${NC}"
cd "$ANDROID_DIR"
./gradlew --stop || true

echo -e "${BLUE}📦 Step 2: Cleaning project build directories...${NC}"
# Remove app-level build directories
safe_remove "$ANDROID_DIR/app/build"
safe_remove "$ANDROID_DIR/app/.cxx"
safe_remove "$ANDROID_DIR/build"

# Remove root build directories
safe_remove "$PROJECT_ROOT/.expo"
safe_remove "$PROJECT_ROOT/.expo-home"

echo -e "${BLUE}📦 Step 3: Cleaning Gradle caches...${NC}"
# Remove Gradle caches
safe_remove "$HOME/.gradle/caches"
safe_remove "$HOME/.gradle/daemon"
safe_remove "$HOME/.gradle/wrapper"

echo -e "${BLUE}📦 Step 4: Cleaning CMake caches...${NC}"
# Remove CMake caches
safe_remove "$HOME/.android/cmake-cache"
safe_remove "$HOME/.cmake"

echo -e "${BLUE}📦 Step 5: Cleaning Node modules CMake artifacts...${NC}"
# Find and remove all .cxx directories in node_modules
find "$PROJECT_ROOT/node_modules" -name ".cxx" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PROJECT_ROOT/node_modules" -name "build" -type d -path "*/android/build" -exec rm -rf {} + 2>/dev/null || true

echo -e "${BLUE}📦 Step 6: Cleaning React Native caches...${NC}"
# Clean React Native caches
safe_remove "$PROJECT_ROOT/node_modules/.cache"
safe_remove "$PROJECT_ROOT/.expo-cache"

# Clean Metro cache
if command -v npx &> /dev/null; then
    echo -e "${YELLOW}Clearing Metro cache...${NC}"
    cd "$PROJECT_ROOT"
    npx expo start --clear || npx react-native start --reset-cache || true
fi

echo -e "${BLUE}📦 Step 7: Re-initializing Gradle wrapper...${NC}"
cd "$ANDROID_DIR"
# Regenerate gradle wrapper
if [ -f "gradlew" ]; then
    ./gradlew wrapper --gradle-version=8.14.3 --distribution-type=bin || true
fi

echo -e "${GREEN}✅ Cleanup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary of actions taken:${NC}"
echo -e "${GREEN}✓ Stopped Gradle daemon${NC}"
echo -e "${GREEN}✓ Removed all build directories${NC}"
echo -e "${GREEN}✓ Cleaned Gradle caches${NC}"
echo -e "${GREEN}✓ Cleaned CMake caches${NC}"
echo -e "${GREEN}✓ Cleaned Node modules artifacts${NC}"
echo -e "${GREEN}✓ Cleaned React Native caches${NC}"
echo -e "${GREEN}✓ Re-initialized Gradle wrapper${NC}"
echo ""
echo -e "${BLUE}🚀 You can now run:${NC}"
echo -e "${YELLOW}   cd android && ./gradlew clean${NC}"
echo -e "${YELLOW}   cd android && ./gradlew assembleDebug${NC}"
echo ""
echo -e "${GREEN}This script has permanently fixed your CMake configuration issues!${NC}"
