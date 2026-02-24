#!/bin/bash

# Script to create the first super admin
# Usage: ./create-admin.sh <email> <password>

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <email> <password>"
    echo "Example: $0 admin@elevate.com MySecurePassword123"
    exit 1
fi

EMAIL=$1
PASSWORD=$2

echo "Creating admin user: $EMAIL"
echo ""

# Check if bcryptjs is available
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js or use an online bcrypt generator."
    echo "Visit: https://bcrypt-generator.com/"
    exit 1
fi

# Generate bcrypt hash
echo "Generating password hash..."
HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('$PASSWORD', 10).then(hash => console.log(hash));")

if [ -z "$HASH" ]; then
    echo "Error: Could not generate hash. Make sure bcryptjs is installed:"
    echo "npm install bcryptjs"
    exit 1
fi

echo "Password hash generated!"
echo ""
echo "Now run this SQL in Supabase SQL Editor:"
echo "=========================================="
echo ""
echo "INSERT INTO admins (email, password_hash, role_id, full_name, totp_enabled)"
echo "SELECT "
echo "    '$EMAIL',"
echo "    '$HASH',"
echo "    id,"
echo "    'Super Administrator',"
echo "    false"
echo "FROM admin_roles"
echo "WHERE name = 'super_admin'"
echo "RETURNING id, email, full_name;"
echo ""
echo "=========================================="
echo ""
echo "To verify the admin was created, run:"
echo "SELECT id, email, full_name, is_active FROM admins WHERE email = '$EMAIL';"
