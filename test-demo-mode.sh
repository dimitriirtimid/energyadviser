#!/bin/bash
# Demo Mode Test Script
# Tests all demo mode endpoints

BASE_URL="http://localhost:3000"
COOKIES_FILE=".cookies.txt"

echo "================================"
echo "Energy Adviser - Demo Mode Tests"
echo "================================"
echo ""

# Test 1: Check demo status
echo "📋 Test 1: Check demo status..."
DEMO_STATUS=$(curl -s "$BASE_URL/api/auth/demo-status")
echo "Response: $DEMO_STATUS"
echo ""

# Test 2: Demo login
echo "🔐 Test 2: Demo login..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIES_FILE" "$BASE_URL/api/auth/demo-login")
echo "Response: $LOGIN_RESPONSE"
echo ""

# Test 3: Get meters
echo "📊 Test 3: Get meters..."
METERS=$(curl -s -b "$COOKIES_FILE" "$BASE_URL/api/energy/meters")
echo "Response: $METERS"
echo ""

# Test 4: Get consumption (last 7 days)
echo "⚡ Test 4: Get consumption (7 days)..."
CONSUMPTION=$(curl -s -b "$COOKIES_FILE" "$BASE_URL/api/energy/consumption?days=7")
echo "Response: $CONSUMPTION"
echo ""

# Test 5: Get today's consumption
echo "📈 Test 5: Get today's consumption..."
TODAY=$(curl -s -b "$COOKIES_FILE" "$BASE_URL/api/energy/today")
echo "Response: $TODAY"
echo ""

# Test 6: Check auth status
echo "✅ Test 6: Check auth status..."
STATUS=$(curl -s -b "$COOKIES_FILE" "$BASE_URL/api/auth/status")
echo "Response: $STATUS"
echo ""

# Test 7: Test analysis endpoint with demo data
echo "🔬 Test 7: Analyze demo data..."
DATA=$(curl -s -b "$COOKIES_FILE" "$BASE_URL/api/energy/consumption?days=7")
# Extract the consumption data from the response and send it for analysis
# This is a simplified example - adjust based on your actual API response structure

echo "================================"
echo "Tests complete!"
echo "Clean up: rm $COOKIES_FILE"
echo "================================"
