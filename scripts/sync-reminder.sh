#!/bin/bash

# Sync Reminder Script
# Run this every 30 minutes to remind you to sync changes

echo "🔄 Sync Reminder - $(date)"
echo "==============================="
echo ""

# Check if there are any uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes:"
    git status --porcelain
    echo ""
    echo "💡 Run these commands to sync:"
    echo "   git add ."
    echo "   git commit -m 'your message'"
    echo "   git push"
    echo ""
    echo "📝 Or ask Claude to help you sync!"
else
    echo "✅ All changes are committed"
fi

echo ""
echo "==============================="
echo "Next reminder in 30 minutes"
