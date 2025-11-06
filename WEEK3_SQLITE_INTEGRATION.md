# Week 3: SQLite Database Integration
## Step-by-Step Implementation Guide

---

## **Current Status Assessment**

✅ **Already Complete:**
- Prisma schema defined with `Category` and `Todo` models
- Prisma Client configured for SQLite
- Database URL ready in schema (`env("DATABASE_URL")`)
- Seed data logic exists in `todoStore.ts`

❌ **Needs Implementation:**
- `.env` file with `DATABASE_URL`
- Database file creation via migrations
- Prisma Client generation
- Verify seed data execution

---

## **Step 1: Create Environment Configuration**

### 1.1 Create `.env` File
Create a `.env` file in your project root:

```bash
# .env
DATABASE_URL="file:./dev.db"
```

**What this does:**
- Tells Prisma where to create/find the SQLite database file
- `file:./dev.db` creates `dev.db` in the `prisma/` directory

### 1.2 Update `.gitignore`
Ensure `.env` and database files are ignored:

```bash
# Add to .gitignore if not already present
.env
*.db
*.db-journal
```

**Why:** Never commit sensitive credentials or local development databases to Git.

---

## **Step 2: Initialize Database with Migrations**

### 2.1 Create Initial Migration
Run the Prisma migrate command:

```bash
npm run prisma:migrate
```

**When prompted for a migration name, enter:** `initial_setup`

**What this does:**
- Creates a `migrations/` folder with SQL files
- Generates the `dev.db` SQLite database file
- Creates `Category` and `Todo` tables with your schema
- Generates/updates the Prisma Client with TypeScript types

### 2.2 Verify Migration Success
You should see output similar to:
```
✔ Generated Prisma Client
✔ Applied migration initial_setup
```

Check that these files now exist:
- `prisma/dev.db` (your SQLite database)
- `prisma/migrations/XXXXXX_initial_setup/migration.sql`

---

## **Step 3: Generate Prisma Client**

### 3.1 Ensure Client is Generated
Run (if not done automatically):

```bash
npm run prisma:generate
```

**What this does:**
- Generates TypeScript types from your Prisma schema
- Creates the `@prisma/client` package in `node_modules`
- Provides full type safety for database queries

### 3.2 Verify Generated Types
The Prisma Client should now include:
- `prisma.category.findMany()`, `prisma.category.create()`, etc.
- `prisma.todo.findMany()`, `prisma.todo.create()`, etc.
- Full TypeScript autocomplete for your models

---

## **Step 4: Fix and Test Database Connection**

### 4.1 Start the Server
```bash
npm run server
```

**Expected output:**
```
🚀 Server running on http://localhost:3100
📋 API endpoints available at http://localhost:3100/api
Initializing seed data...
✔ Seed data initialized successfully
```

**If you see errors:** The error you encountered means the database tables weren't created yet. After running migrations (Step 2), this should be resolved.

### 4.2 Verify Seed Data
The `initializeSeedData()` function in `todoStore.ts` should run automatically and populate:
- 1 "School" category
- 3 sample todos

---

## **Step 5: Explore Your Database with Prisma Studio**

### 5.1 Launch Prisma Studio
```bash
npm run prisma:studio
```

**What this does:**
- Opens a visual database browser at `http://localhost:5555`
- Allows you to view, edit, and delete records
- Provides a GUI alternative to SQL queries

### 5.2 Verify Data
In Prisma Studio, you should see:
- **Category table:** 1 record ("School")
- **Todo table:** 3 records with various statuses

**Try:**
- Adding a new category manually
- Editing a todo's status
- Deleting a record (and see the frontend update)

---

## **Step 6: Test API Endpoints**

### 6.1 Test with VS Code REST Client
Create a `test.http` file:

```http
### Get all categories
GET http://localhost:3100/api/categories

### Get all todos
GET http://localhost:3100/api/todos

### Create a new category
POST http://localhost:3100/api/categories
Content-Type: application/json

{
  "name": "Personal"
}

### Create a new todo
POST http://localhost:3100/api/todos
Content-Type: application/json

{
  "name": "Buy groceries",
  "status": "pending",
  "categoryId": "PASTE_CATEGORY_ID_HERE",
  "dueDate": "2025-11-01"
}

### Update a todo
PUT http://localhost:3100/api/todos/PASTE_TODO_ID_HERE
Content-Type: application/json

{
  "status": "completed"
}

### Delete a todo
DELETE http://localhost:3100/api/todos/PASTE_TODO_ID_HERE
```

### 6.2 Verify Persistence
1. Add data via API or Prisma Studio
2. Stop the server (`Ctrl+C`)
3. Restart the server (`npm run server`)
4. Verify data is still there (persistent!)

---

## **Step 7: Optional Enhancements**

### 7.1 Create a Dedicated Seed Script
Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.todo.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  const school = await prisma.category.create({
    data: { name: 'School' }
  })

  const personal = await prisma.category.create({
    data: { name: 'Personal' }
  })

  // Create todos
  await prisma.todo.createMany({
    data: [
      {
        name: 'Mow the Lawn',
        status: 'pending',
        categoryId: school.id,
        dueDate: new Date('2025-10-10')
      },
      {
        name: 'Finish my homework',
        status: 'in-progress',
        categoryId: school.id,
        dueDate: new Date('2025-10-08')
      },
      {
        name: 'Watch class video',
        status: 'completed',
        categoryId: school.id,
        dueDate: new Date('2025-10-03')
      }
    ]
  })

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run with: `npx prisma db seed`

### 7.2 Add Database Reset Script
Add to `package.json` scripts:
```json
{
  "prisma:reset": "prisma migrate reset"
}
```

**Warning:** This deletes all data and re-runs migrations!

---

## **Step 8: Environment-Specific Configurations**

### 8.1 Create `.env.example`
Create a template for other developers:

```bash
# .env.example
DATABASE_URL="file:./dev.db"
PORT=3100
```

### 8.2 Development vs Production
For production (future), you might use:
```bash
DATABASE_URL="file:./production.db"
# Or PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

---

## **Common Issues & Solutions**

### Issue 1: "Table does not exist"
**Solution:** Run `npm run prisma:migrate`

### Issue 2: "Cannot find module '@prisma/client'"
**Solution:** Run `npm run prisma:generate`

### Issue 3: Seed data runs every time
**Current behavior:** The `initializeSeedData()` function checks if data exists before seeding.
**If you want fresh data:** Delete `prisma/dev.db` and restart.

### Issue 4: Migration conflicts
**Solution:** 
```bash
npm run prisma:migrate
# If that fails:
npx prisma migrate reset  # ⚠️ Deletes all data!
```

---

## **Verification Checklist**

- [ ] `.env` file created with `DATABASE_URL`
- [ ] `prisma/dev.db` file exists
- [ ] Migrations folder created with initial migration
- [ ] Server starts without errors
- [ ] Seed data appears in database
- [ ] Prisma Studio shows data correctly
- [ ] API endpoints work (GET, POST, PUT, DELETE)
- [ ] Data persists after server restart
- [ ] Frontend can communicate with API

---

## **Next Steps (Beyond Week 3)**

1. **Advanced Queries:**
   - Filter todos by category, status, or date range
   - Sort by due date, creation date, or name
   - Implement pagination for large datasets

2. **Database Relationships:**
   - Add user authentication (User → Todo relationship)
   - Add tags or labels (many-to-many relationship)

3. **Production Deployment:**
   - Deploy to Railway, Render, or Vercel
   - Use PostgreSQL instead of SQLite for production
   - Implement database backups

4. **Performance:**
   - Add indexes for frequently queried fields
   - Implement caching (Redis)
   - Monitor query performance with Prisma metrics

---

## **Key Learning Outcomes**

✅ **Database Persistence:** Data survives server restarts  
✅ **Type Safety:** Prisma provides full TypeScript support  
✅ **Migrations:** Schema changes are tracked and versioned  
✅ **Visual Tools:** Prisma Studio for database inspection  
✅ **RESTful API:** Complete CRUD operations with real database  
✅ **Environment Config:** Separate dev/prod configurations  

---

## **Resources**

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma SQLite Guide](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [Prisma Migrate Reference](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Studio](https://www.prisma.io/studio)

---

**🎉 Congratulations!** You now have a fully functional Express + Prisma + SQLite API server with persistent data storage!
