#!/bin/bash

# Firebase Security Migration Script
# This script helps migrate to the new secure Firebase configuration

echo "🔒 Buraq AI - Firebase Security Migration"
echo "=========================================="
echo ""

# Check if running in correct directory
if [ ! -f "firebase-init.js" ]; then
    echo "❌ Error: Please run this script from the Buraq-Website directory"
    exit 1
fi

echo "✅ Found firebase-init.js"

# Step 1: Remove sensitive backup files
echo ""
echo "Step 1: Removing sensitive backup files..."
if [ -f "firebase-init.js.backup" ]; then
    echo "  🗑️  Removing firebase-init.js.backup"
    rm -f firebase-init.js.backup
fi
if [ -f "main.js.backup" ]; then
    echo "  🗑️  Removing main.js.backup"
    rm -f main.js.backup
fi
echo "✅ Backup files removed"

# Step 2: Create .env file if it doesn't exist
echo ""
echo "Step 2: Setting up environment variables..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "  📝 Created .env from .env.example"
        echo "  ⚠️  IMPORTANT: Edit .env with your actual credentials"
    else
        echo "  ❌ .env.example not found"
    fi
else
    echo "  ℹ️  .env already exists (skipping)"
fi

# Step 3: Verify .gitignore
echo ""
echo "Step 3: Verifying .gitignore..."
if grep -q "^.env$" .gitignore; then
    echo "  ✅ .env is in .gitignore"
else
    echo "  ⚠️  WARNING: .env is NOT in .gitignore"
    echo "  Adding .env to .gitignore..."
    echo ".env" >> .gitignore
fi

if grep -q "^\*.backup$" .gitignore; then
    echo "  ✅ *.backup is in .gitignore"
else
    echo "  ⚠️  WARNING: *.backup is NOT in .gitignore"
    echo "  Adding *.backup to .gitignore..."
    echo "*.backup" >> .gitignore
fi

# Step 4: Check git status
echo ""
echo "Step 4: Checking git status..."
echo ""
git status --short

echo ""
echo "=========================================="
echo "🎉 Migration Preparation Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Edit firebase-config-loader.js:"
echo "   - Update line 67-75 with your Firebase credentials"
echo "   - OR set up a secure backend endpoint at /api/firebase-config"
echo ""
echo "2. Deploy Firestore Security Rules:"
echo "   firebase deploy --only firestore:rules"
echo ""
echo "3. Remove credentials from git history (if already committed):"
echo "   git filter-branch --force --index-filter \\"
echo "     'git rm --cached --ignore-unmatch *.backup' \\"
echo "     --prune-empty --tag-name-filter cat -- --all"
echo ""
echo "4. Commit changes:"
echo "   git add ."
echo "   git commit -m 'Security: Implement Firebase credential protection'"
echo "   git push origin main --force  # Only if you cleaned history"
echo ""
echo "5. Test the website:"
echo "   - Test form submission"
echo "   - Test rate limiting (submit 6 times quickly)"
echo "   - Check browser console for errors"
echo ""
echo "6. Monitor Firebase Console:"
echo "   - Check for unauthorized access"
echo "   - Set up usage alerts"
echo "   - Review security rule denials"
echo ""
echo "📖 For detailed instructions, see SECURITY-GUIDE.md"
echo ""
