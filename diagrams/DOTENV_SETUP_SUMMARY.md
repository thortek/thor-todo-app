# dotenv Setup Summary

## What Changed in Week 2 Guide

The Week 2 Prisma ORM guide has been updated to include proper dotenv configuration. Here's what was added:

---

## 1. Installation (Part 2.1)

**Added `dotenv` to the installation command:**

```bash
npm install --save-dev prisma
npm install @prisma/client dotenv
```

**Explanation added:**
- `dotenv`: Loads environment variables from `.env` file into `process.env`

---

## 2. Configuration (New Part 2.4)

**New section added: "Configure dotenv in Your Server"**

Shows how to update `server/index.ts`:

```typescript
// Load environment variables FIRST
import dotenv from 'dotenv'
dotenv.config()

// Now import everything else
import express from 'express'
// ... rest of imports
```

**Key Points Emphasized:**
- ✅ `dotenv.config()` must run FIRST before any code that accesses `process.env`
- ✅ Prisma Client reads `DATABASE_URL` from `process.env`
- ✅ Loading it first ensures all environment variables are available

**Alternative method shown:**
- Node.js built-in `--env-file` flag (for Node 20.6+)
- But recommends dotenv for compatibility

---

## 3. Updated Checklist (Part 12.3)

**Added to Pre-Week 3 Checklist:**
- [ ] Prisma packages installed (including `dotenv`)
- [ ] `dotenv` configured in `server/index.ts` (imported and called before other imports)

---

## 4. Enhanced Troubleshooting (Part 13)

**Added three new troubleshooting sections:**

### "Cannot find module 'dotenv'"
Solution: Install dotenv package

### "Environment variable not found: DATABASE_URL"
Enhanced with dotenv-specific checks:
1. Check `.env` file exists
2. Ensure dotenv is installed
3. Verify `dotenv.config()` is called at the top

### "Environment variables not loading"
New section covering:
- Call order of `dotenv.config()`
- `.env` file syntax errors
- File location verification

---

## 5. Updated Summary (Part 12.1)

**Changed:**
- ❌ Old: "Installed Prisma: CLI and client packages"
- ✅ New: "Installed Prisma: CLI, client packages, and dotenv"

**Added:**
- ✅ "Configured Environment: Set up dotenv to load environment variables"

---

## Why This Matters

### Without dotenv:
```typescript
// ❌ This won't work - process.env.DATABASE_URL is undefined
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

### With dotenv:
```typescript
// ✅ This works - environment variables are loaded
import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
// Now DATABASE_URL is available in process.env
```

---

## Quick Setup Commands

For students starting Week 2:

```bash
# Install all dependencies including dotenv
npm install --save-dev prisma
npm install @prisma/client dotenv

# Initialize Prisma
npx prisma init --datasource-provider sqlite

# Generate Prisma Client
npx prisma generate
```

Then update `server/index.ts` to add dotenv at the top!

---

## Common Student Mistakes

1. **Forgetting to install dotenv** → Server can't read `.env` file
2. **Calling `dotenv.config()` too late** → Variables not loaded in time
3. **Wrong `.env` file location** → Should be in project root
4. **Syntax errors in `.env`** → No spaces around `=`, no quotes needed

---

## Testing dotenv Works

Add this temporary test to `server/index.ts`:

```typescript
import dotenv from 'dotenv'
dotenv.config()

console.log('DATABASE_URL:', process.env.DATABASE_URL)
// Should print: DATABASE_URL: file:./dev.db
```

If you see `undefined`, dotenv isn't configured correctly!
