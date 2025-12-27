#!/bin/bash
# Auto-verification script for Cursor edits
# This script verifies file edits were actually written to disk

FILE="$1"
PATTERN="$2"
EXPECTED_COUNT="${3:-1}"

if [ ! -f "$FILE" ]; then
    echo "❌ File not found: $FILE"
    exit 1
fi

COUNT=$(grep -c "$PATTERN" "$FILE" 2>/dev/null || echo "0")

if [ "$COUNT" -ge "$EXPECTED_COUNT" ]; then
    echo "✅ Verification passed: Pattern '$PATTERN' found $COUNT time(s) in $FILE"
    exit 0
else
    echo "❌ Verification failed: Pattern '$PATTERN' found $COUNT time(s), expected at least $EXPECTED_COUNT"
    exit 1
fi


