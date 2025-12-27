#!/usr/bin/env python3
"""
Cursor Edit Fix - Reliable file editing with verification
This script ensures file edits are actually written to disk
"""

import sys
import re
import os

def read_file(filepath):
    """Read file and return content"""
    with open(filepath, 'r') as f:
        return f.read()

def write_file(filepath, content):
    """Write file and verify it was written"""
    with open(filepath, 'w') as f:
        f.write(content)
    # Verify by reading back
    verify_content = read_file(filepath)
    if verify_content == content:
        return True
    return False

def replace_in_file(filepath, old_string, new_string):
    """Reliably replace string in file with verification"""
    try:
        content = read_file(filepath)
        
        if old_string not in content:
            print(f"⚠️ Pattern not found in {filepath}")
            return False
        
        new_content = content.replace(old_string, new_string)
        
        if write_file(filepath, new_content):
            print(f"✅ Successfully updated {filepath}")
            return True
        else:
            print(f"❌ Failed to verify write to {filepath}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 .cursor-edit-fix.py <filepath> <old_string_file> <new_string_file>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    old_string_file = sys.argv[2]
    new_string_file = sys.argv[3]
    
    # Read old and new strings from files (to handle multiline and special chars)
    with open(old_string_file, 'r') as f:
        old_string = f.read()
    
    with open(new_string_file, 'r') as f:
        new_string = f.read()
    
    if replace_in_file(filepath, old_string, new_string):
        sys.exit(0)
    else:
        sys.exit(1)


