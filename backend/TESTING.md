# Testing Guide - Database Services

## 🚀 Quick Start

### 1. Build Check
```bash
cd backend
bun run build
```
**Expected:** Build completes without errors

---

### 2. Start Development Server
```bash
bun run start:dev
```

**Expected Output:**
```
✅ Database connected
🚀 Backend server running on http://localhost:3001
```

---

### 3. Test Health Endpoint

Open your browser or use curl:

```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-17T...",
  "database": "connected",
  "services": {
    "users": { "status": "working", "count": 0 },
    "developers": { "status": "working", "count": 0 },
    "founders": { "status": "working", "count": 0 },
    "projects": { "status": "working", "count": 0 },
    "jobs": { "status": "working", "count": 0 },
    "vouches": { "status": "working", "count": 0 },
    "alerts": { "status": "working" },
    "sessions": { "status": "working", "count": 0 },
    "reputation": { "status": "working" },
    "hallOfFame": { "status": "working" }
  }
}
```

✅ **If you see this, ALL services are working!**

---

## 🧪 Testing Individual Services

### Method 1: Using Prisma Studio

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:
- View all tables
- Add test data
- Query the database
- Verify relationships

---

### Method 2: Create Test Data Script

Create `backend/src/scripts/test-services.ts`:

```typescript
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

async function testServices() {
  try {
    console.log('🧪 Testing Database Services...\n');

    // Test 1: Create a user
    console.log('1️⃣ Creating test user...');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        role: 'DEVELOPER',
        passwordHash: 'test_hash',
      },
    });
    console.log('✅ User created:', user.email);

    // Test 2: Create a developer profile
    console.log('\n2️⃣ Creating developer profile...');
    const developer = await prisma.developer.create({
      data: {
        user: { connect: { id: user.id } },
        username: 'testdev',
        fullName: 'Test Developer',
        github: 'github.com/testdev',
        contactNumber: '+1234567890',
      },
    });
    console.log('✅ Developer created:', developer.username);

    // Test 3: Create a project
    console.log('\n3️⃣ Creating project...');
    const project = await prisma.project.create({
      data: {
        developer: { connect: { id: developer.id } },
        name: 'Test Project',
        description: 'A test project',
        livePlatformUrl: 'https://example.com',
        repositoryUrl: 'https://github.com/test/project',
        teammateNames: [],
        technologies: ['TypeScript', 'NestJS'],
      },
    });
    console.log('✅ Project created:', project.name);

    // Test 4: Get all data
    console.log('\n4️⃣ Fetching all data...');
    const allDevelopers = await prisma.developer.findMany({
      include: {
        user: true,
        projects: true,
      },
    });
    console.log('✅ Found', allDevelopers.length, 'developers');
    console.log(JSON.stringify(allDevelopers, null, 2));

    // Cleanup
    console.log('\n5️⃣ Cleaning up...');
    await prisma.project.deleteMany();
    await prisma.developer.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleanup complete');

    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testServices();
```

Run it:
```bash
bun run src/scripts/test-services.ts
```

---

### Method 3: Using HTTP Requests

Install a REST client extension in VS Code, or use curl/Postman.

**Example: Test User Creation**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "role": "DEVELOPER",
    "passwordHash": "hashed_password"
  }'
```

---

## 🔍 Troubleshooting

### Issue: "Database not connected"

**Solution:**
```bash
# Check if PostgreSQL is running
psql -U user -d web3_talent

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection manually
bunx prisma db push
```

---

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

---

### Issue: "Prisma Client not found"

**Solution:**
```bash
bunx prisma generate
bun run build
```

---

## 📊 Database Migrations

### Check Migration Status
```bash
bunx prisma migrate status
```

### Create Initial Migration
```bash
bunx prisma migrate dev --name init
```

### Reset Database (DANGER: Deletes all data)
```bash
bunx prisma migrate reset
```

---

## 🧪 Running Tests

### Unit Tests
```bash
bun run test
```

### E2E Tests
```bash
bun run test:e2e
```

### Test Coverage
```bash
bun run test:cov
```

---

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns status "healthy"
- [ ] All services show status "working"
- [ ] Database connection successful
- [ ] Can create test data via Prisma Studio
- [ ] TypeScript compilation passes (`bun run build`)
- [ ] No ESLint errors

---

## 🎯 Next Steps

Once all services are verified:

1. **Create Controllers** for your API endpoints
   ```bash
   nest g controller users
   nest g controller developers
   ```

2. **Add DTOs** for validation
   ```bash
   mkdir src/users/dto
   touch src/users/dto/create-user.dto.ts
   ```

3. **Implement Authentication**
   ```bash
   nest g module auth
   nest g service auth
   ```

4. **Add Validation Pipes**
   ```typescript
   app.useGlobalPipes(new ValidationPipe());
   ```

---

## 📝 Quick Commands Reference

```bash
# Development
bun run start:dev          # Start dev server
bun run build             # Build production
bun run start:prod        # Run production build

# Database
bunx prisma studio         # Open database GUI
bunx prisma generate       # Generate Prisma Client
bunx prisma migrate dev    # Create migration
bunx prisma db push        # Push schema without migration

# Testing
bun run test              # Run unit tests
bun run test:e2e          # Run e2e tests
bun run test:cov          # Test coverage

# Health Check
curl http://localhost:3001/api/health
```

---

**🎉 Your services are ready when the health check returns "healthy" status!**
