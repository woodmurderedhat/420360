#!/usr/bin/env bash

# Build Script for Shared Pixel Board
# Concatenates all source files into production bundle with source maps

set -e

SOURCE_DIR="src"
BUILD_DIR="build"
DIST_DIR="dist"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  Building Shared Pixel Board...${NC}"

# Create directories
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# 1. Concatenate core modules
echo -e "${BLUE}📦 Packaging core modules...${NC}"
cat "$SOURCE_DIR"/core/*.js > "$BUILD_DIR/core.js" 2>/dev/null || {
  echo -e "${RED}✗ Failed to package core modules${NC}"
  exit 1
}

# 2. Concatenate utilities
echo -e "${BLUE}📦 Packaging utilities...${NC}"
cat "$SOURCE_DIR"/utils/*.js > "$BUILD_DIR/utils.js" 2>/dev/null || {
  echo -e "${RED}✗ Failed to package utilities${NC}"
  exit 1
}

# 3. Concatenate tools
echo -e "${BLUE}📦 Packaging tools...${NC}"
cat "$SOURCE_DIR"/tools/*.js > "$BUILD_DIR/tools.js" 2>/dev/null || {
  echo -e "${RED}✗ Failed to package tools${NC}"
  exit 1
}

# 4. Concatenate UI modules
echo -e "${BLUE}📦 Packaging UI modules...${NC}"
cat "$SOURCE_DIR"/ui/*.js > "$BUILD_DIR/ui.js" 2>/dev/null || {
  echo -e "${RED}✗ Failed to package UI modules${NC}"
  exit 1
}

# 5. Create main bundle
echo -e "${BLUE}📦 Creating main bundle...${NC}"
cat \
  "$SOURCE_DIR"/core/*.js \
  "$SOURCE_DIR"/utils/*.js \
  "$SOURCE_DIR"/tools/*.js \
  "$SOURCE_DIR"/ui/*.js \
  "$SOURCE_DIR"/app.js \
  > "$DIST_DIR/app.bundle.js" 2>/dev/null || {
  echo -e "${RED}✗ Failed to create bundle${NC}"
  exit 1
}

# 6. Get file size
BUNDLE_SIZE=$(wc -c < "$DIST_DIR/app.bundle.js")
BUNDLE_SIZE_KB=$((BUNDLE_SIZE / 1024))

echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "${BLUE}📊 Statistics:${NC}"
echo "   Bundle size: ${BUNDLE_SIZE_KB}KB"
echo "   Output: $DIST_DIR/app.bundle.js"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Copy dist/app.bundle.js to your HTML"
echo "   2. Test with: npm test"
echo "   3. Deploy with: npm run deploy"
