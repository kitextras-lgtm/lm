#!/bin/bash

# Auto Sync Reminder - Runs every 30 minutes
# Usage: ./auto-sync-reminder.sh

echo "🚀 Starting auto-sync reminder (every 30 minutes)"
echo "Press Ctrl+C to stop"
echo ""

while true; do
    ./sync-reminder.sh
    echo ""
    echo "⏰ Sleeping for 30 minutes..."
    sleep 1800  # 30 minutes = 1800 seconds
done
