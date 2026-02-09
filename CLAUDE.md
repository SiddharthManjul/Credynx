# Web3 Developer-Founder Connecting Platform

## Project Overview

A reputation-based platform connecting Web3 developers with founders, solving the visibility and hiring pipeline problem in the Web3 ecosystem. The platform emphasizes contributions over connections, creating a merit-based job marketplace.

### Core Value Propositions

**For Developers:**
- Visibility in the Web3 ecosystem through reputation-based profiles
- Job opportunities at foundations and ecosystem startups
- Support for building their own startups (funding focus + additional resources)
- Hackathon/grant alerts and peer sharing
- Recognition through hall of fame for hackathons & grants

**For Founders:**
- Access to vetted, high-quality developers
- Data-driven hiring based on reputation metrics
- Beta testers and early users for products
- Reduced time-to-hire with smart matching

### End Goals
1. Seamless founder-employee connecting pipeline
2. Clear reputation-based job platform where contributions >>> connections
3. Strategic partnerships with Web3 ecosystems

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Socket.io client
- **Charts/Analytics**: Recharts

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Validation**: class-validator + class-transformer
- **Authentication**: Passport.js (JWT + OAuth for GitHub)
- **Real-time**: Socket.io (WebSocket gateway)
- **Job Queue**: Bull (Redis-based)
- **Caching**: Redis
- **File Upload**: Multer

### Database
- **Primary DB**: PostgreSQL 15+
- **Cache/Queue**: Redis 7+
- **Search** (future): Elasticsearch or Meilisearch

### DevOps
- **Version Control**: Git + GitHub
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (frontend) + Railway/Render (backend)
- **Monitoring**: Sentry (error tracking), PostHog (analytics)

### External Services/APIs
- **GitHub API**: Profile data, repositories, contributions
- **Email**: Resend or SendGrid
- **Blockchain Indexers** (future): On-chain reputation tracking

---

## Project Structure

```
web3-talent-connect/
├── frontend/                    # Next.js application
│   ├── app/                    # App router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── profile/           # Profile management
│   │   ├── developers/        # Developer directory
│   │   ├── projects/          # Project showcase
│   │   ├── jobs/              # Job board
│   │   └── hall-of-fame/      # Hall of Fame
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── features/          # Feature-specific components
│   │   ├── layout/            # Layout components
│   │   └── shared/            # Shared components
│   ├── lib/
│   │   ├── api/               # API client functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   └── validations/       # Zod schemas
│   └── types/                 # TypeScript types
│
├── backend/                    # NestJS application
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── developers/        # Developer profiles
│   │   ├── profile/           # Profile management
│   │   ├── projects/          # Project management
│   │   ├── jobs/              # Job postings
│   │   ├── reputation/        # Reputation calculation
│   │   ├── vouching/          # Tier-based vouching
│   │   ├── referrals/         # Referral system
│   │   ├── alerts/            # Alert/notification system
│   │   ├── github/            # GitHub integration
│   │   ├── hackathons/        # Hackathon tracking
│   │   ├── grants/            # Grants tracking
│   │   ├── hall-of-fame/      # Hall of Fame module
│   │   ├── sessions/          # Founder-dev sessions
│   │   ├── common/            # Shared utilities
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── test/
│
└── shared/                     # Shared types
    └── types/
```

---

## Core Features & Modules

### 1. Profile Page & Developer Registration

**Purpose**: Allow developers to create and manage comprehensive profiles

**Key Features**:
- **Basic Information**: Username (unique), full name, email, contact number, social links (Twitter, LinkedIn, GitHub required)
- **Project Management**: Add/edit/delete projects with validation (name, live URL, GitHub repo, description, teammates)
- **Profile Visibility**: Public view, reputation score, projects showcase, tier badge

### 2. Developer Directory

**Purpose**: Searchable, filterable directory with reputation-based ranking

**Features**:
- Profile cards with username, reputation score, tier badge, skills, projects count
- Advanced filtering: tier, skills, availability, location
- Sorting: reputation (highest first), recent activity, alphabetical
- Click card → Navigate to full profile

### 3. Project Directory

**Purpose**: Automatic listing of all developer projects

**Features**:
- Auto-populated from developer submissions
- Cards showing: project name, developer, description, tech stack, live/GitHub links
- Filtering: technology, team vs solo, recent additions
- Validation: Live URL accessibility (HTTP 200), public GitHub repo

### 4. Reputation System

**Purpose**: Multi-parameter scoring to rank developers and assign tiers

**Reputation Parameters**:
1. **GitHub Profile Score** (30%): Repos, stars, forks, commits, PRs, code quality
2. **Projects Score** (25%): Completed projects, complexity, tech diversity, deployed projects
3. **Time Investment Score** (15%): Estimated hours, consistency, recent activity
4. **Hackathons & Grants Score** (20%): Wins, placements, grants, prize amounts
5. **Community Score** (10%): Vouches (weighted by tier), session participation

**Tier System**:
- **Tier 4** (Entry): 0-25 score
- **Tier 3** (Intermediate): 26-50 score
- **Tier 2** (Advanced): 51-75 score
- **Tier 1** (Elite): 76-100 score

**Implementation**: Daily background job recalculation, Redis caching, historical tracking

### 5. Tier-Based Vouching System

**Purpose**: Hierarchical endorsement where higher tiers vouch for lower tiers

**Vouching Rules**:
- **Tier 1** can vouch for Tier 2, 3, 4
- **Tier 2** can vouch for Tier 3, 4
- **Tier 3** can vouch for Tier 4
- **Tier 4** cannot vouch
- **Admin** can vouch for Tier 1

**Eligibility** (to receive vouch): Minimum reputation, 2+ open-source projects, active GitHub (commits in last 3 months), complete profile, account 30+ days old

**Vouch Weights**: Tier 1 (3.0), Tier 2 (2.0), Tier 3 (1.0), Admin (5.0)

**Anti-gaming**: Max 5 vouches/month, one vouch per person, cooldown periods, revocation capability

### 6. Referral System

**Purpose**: Smart job-developer matching

**Workflow**:
1. Company posts job → enters referral queue
2. Algorithm scores all developers (reputation, tier, skills, projects)
3. Top 10 matches presented to admin
4. Selected developers notified
5. Developers express interest/decline
6. Company receives shortlist
7. Track outcomes → improve algorithm

### 7. Alert System

**Purpose**: Real-time notifications for key events

**Alert Types**: Job matches, vouches, founder outreach, hackathon/grant opportunities, sessions, profile views, weekly digest

**Channels**: In-app (WebSocket), email (configurable), push (future)

### 8. Founder-Developer Sessions

**Purpose**: Facilitate formal/informal interactions

**Session Types**: Formal (interviews), Informal (coffee chats), Community calls

**Features**: Calendar integration, scheduling, video call links, notes, attendance tracking, recurring support

### 9. GitHub Issues Integration

**Purpose**: Aggregate open issues from Web3 ecosystems

**Features**: Sync from repos, label filtering (good-first-issue, help-wanted, bounty), ecosystem tagging, difficulty estimation, direct application

### 10. Hall of Fame

**Purpose**: Track and showcase hackathon wins, grants, open-source contributions

**Categories**: Hackathon winners, grant recipients, top open-source contributors

**Verification Process**:
1. Developer submits with proof URL
2. Admin reviews
3. Verify: valid proof, name/GitHub match, amount
4. Approve/reject
5. Approved → appears in Hall of Fame → impacts reputation

---

## Database Schema (Prisma)

**Note**: This project uses Prisma 7. The DATABASE_URL is configured in `prisma.config.ts` instead of the schema file.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum UserRole {
  DEVELOPER
  FOUNDER
  ADMIN
}

enum DeveloperTier {
  TIER_1  // Elite (76-100)
  TIER_2  // Advanced (51-75)
  TIER_3  // Intermediate (26-50)
  TIER_4  // Entry (0-25)
}

enum Availability {
  AVAILABLE
  BUSY
  NOT_LOOKING
}

enum JobStatus {
  OPEN
  FILLED
  CLOSED
}

enum ReferralStatus {
  PENDING
  INTERESTED
  NOT_INTERESTED
  INTERVIEWING
  HIRED
  REJECTED
}

enum SessionType {
  FORMAL
  INFORMAL
  COMMUNITY_CALL
}

enum ParticipantStatus {
  INVITED
  CONFIRMED
  DECLINED
  ATTENDED
  NO_SHOW
}

enum AlertType {
  JOB_MATCH
  VOUCH
  MESSAGE
  HACKATHON
  SESSION
  PROFILE_VIEW
  TIER_UPGRADE
  WEEKLY_DIGEST
}

enum HackathonStatus {
  UPCOMING
  ONGOING
  COMPLETED
}

enum GrantStatus {
  OPEN
  CLOSED
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String?
  role          UserRole
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  developer     Developer?
  founder       Founder?
  alerts        Alert[]
  sessions      SessionParticipant[]
  notificationPreferences NotificationPreferences?

  @@index([email])
}

model Developer {
  id                  String          @id @default(uuid())
  userId              String          @unique
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  username            String          @unique
  fullName            String
  contactNumber       String
  twitter             String?
  linkedin            String?
  github              String          // Required

  bio                 String?         @db.Text
  location            String?
  availability        Availability    @default(AVAILABLE)

  tier                DeveloperTier   @default(TIER_4)
  reputationScore     Float           @default(0)

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  projects            Project[]
  reputationScores    ReputationScore[]
  reputationHistory   ReputationHistory[]
  vouchesGiven        Vouch[]         @relation("VoucherRelation")
  vouchesReceived     Vouch[]         @relation("VouchedUserRelation")
  vouchEligibility    VouchEligibility?
  referrals           Referral[]
  hackathonParticipations HackathonParticipation[]
  grantRecipients     GrantRecipient[]
  githubIssues        GitHubIssue[]
  openSourceContributions OpenSourceContribution[]

  @@index([username])
  @@index([reputationScore])
  @@index([tier])
  @@index([availability])
}

model Founder {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  companyName     String
  companyWebsite  String?
  position        String
  bio             String?   @db.Text
  linkedinUrl     String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  jobs            Job[]
}

model Project {
  id              String    @id @default(uuid())
  developerId     String
  developer       Developer @relation(fields: [developerId], references: [id], onDelete: Cascade)

  name            String
  description     String    @db.Text
  livePlatformUrl String
  repositoryUrl   String
  teammateNames   String[]

  technologies    String[]
  githubStars     Int       @default(0)
  githubForks     Int       @default(0)

  isVerified      Boolean   @default(false)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([developerId])
  @@index([isVerified])
}

model ReputationScore {
  id              String        @id @default(uuid())
  developerId     String
  developer       Developer     @relation(fields: [developerId], references: [id], onDelete: Cascade)

  totalScore      Float
  tier            DeveloperTier
  githubScore     Float
  projectsScore   Float
  timeScore       Float
  hackathonsScore Float
  communityScore  Float

  calculatedAt    DateTime      @default(now())
  metadata        Json?

  @@index([developerId])
  @@index([calculatedAt])
}

model ReputationHistory {
  id              String        @id @default(uuid())
  developerId     String
  developer       Developer     @relation(fields: [developerId], references: [id], onDelete: Cascade)

  score           Float
  tier            DeveloperTier
  date            DateTime      @default(now())

  @@index([developerId, date])
}

model Vouch {
  id              String        @id @default(uuid())
  voucherId       String
  voucher         Developer     @relation("VoucherRelation", fields: [voucherId], references: [id], onDelete: Cascade)
  voucherTier     DeveloperTier

  vouchedUserId   String
  vouchedUser     Developer     @relation("VouchedUserRelation", fields: [vouchedUserId], references: [id], onDelete: Cascade)
  vouchedUserTier DeveloperTier

  skillsEndorsed  String[]
  message         String?       @db.Text
  weight          Float
  isActive        Boolean       @default(true)

  createdAt       DateTime      @default(now())
  revokedAt       DateTime?
  revokeReason    String?       @db.Text

  @@index([voucherId])
  @@index([vouchedUserId])
  @@index([isActive])
  @@unique([voucherId, vouchedUserId])
}

model VouchEligibility {
  id                  String    @id @default(uuid())
  developerId         String    @unique
  developer           Developer @relation(fields: [developerId], references: [id], onDelete: Cascade)

  isEligible          Boolean
  reasonsNotEligible  String[]
  lastCheckedAt       DateTime  @default(now())

  @@index([developerId])
}

model Job {
  id              String    @id @default(uuid())
  founderId       String
  founder         Founder   @relation(fields: [founderId], references: [id], onDelete: Cascade)

  title           String
  description     String    @db.Text
  requirements    Json
  location        String
  remotePolicy    String
  salaryRange     Json?

  postedAt        DateTime  @default(now())
  closedAt        DateTime?
  status          JobStatus @default(OPEN)

  referrals       Referral[]

  @@index([founderId])
  @@index([status])
  @@index([postedAt])
}

model Referral {
  id              String          @id @default(uuid())
  jobId           String
  job             Job             @relation(fields: [jobId], references: [id], onDelete: Cascade)

  developerId     String
  developer       Developer       @relation(fields: [developerId], references: [id], onDelete: Cascade)

  matchScore      Float
  status          ReferralStatus  @default(PENDING)
  outcome         String?

  referredAt      DateTime        @default(now())
  respondedAt     DateTime?
  outcomeAt       DateTime?

  @@index([jobId])
  @@index([developerId])
  @@index([status])
}

model Alert {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  type            AlertType
  title           String
  message         String    @db.Text
  metadata        Json?

  isRead          Boolean   @default(false)
  createdAt       DateTime  @default(now())
  readAt          DateTime?

  @@index([userId, isRead])
  @@index([createdAt])
}

model NotificationPreferences {
  id                  String   @id @default(uuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  emailNotifications  Boolean  @default(true)
  inAppNotifications  Boolean  @default(true)
  jobMatches          Boolean  @default(true)
  vouches             Boolean  @default(true)
  messages            Boolean  @default(true)
  hackathons          Boolean  @default(true)
  weeklyDigest        Boolean  @default(true)

  updatedAt           DateTime @updatedAt
}

model Session {
  id                  String    @id @default(uuid())
  type                SessionType
  title               String
  description         String?   @db.Text
  hostId              String

  scheduledAt         DateTime
  duration            Int
  meetingLink         String?
  maxParticipants     Int?

  isRecurring         Boolean   @default(false)
  recurrencePattern   Json?

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  participants        SessionParticipant[]

  @@index([scheduledAt])
  @@index([hostId])
}

model SessionParticipant {
  id              String            @id @default(uuid())
  sessionId       String
  session         Session           @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  status          ParticipantStatus @default(INVITED)
  joinedAt        DateTime?
  leftAt          DateTime?

  @@unique([sessionId, userId])
  @@index([sessionId])
  @@index([userId])
}

model GitHubIssue {
  id              String     @id @default(uuid())
  externalId      String     @unique

  repositoryUrl   String
  title           String
  description     String     @db.Text
  labels          String[]
  ecosystem       String
  difficulty      String?
  bountyAmount    Float?

  state           String     @default("OPEN")
  assignedToId    String?
  assignedTo      Developer? @relation(fields: [assignedToId], references: [id])

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  closedAt        DateTime?

  @@index([state])
  @@index([ecosystem])
  @@index([assignedToId])
}

model Hackathon {
  id              String           @id @default(uuid())
  name            String
  ecosystem       String
  organizer       String
  prizePool       Float?
  startDate       DateTime
  endDate         DateTime
  websiteUrl      String
  status          HackathonStatus  @default(UPCOMING)

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  participations  HackathonParticipation[]

  @@index([ecosystem])
  @@index([status])
  @@index([startDate])
}

model HackathonParticipation {
  id              String     @id @default(uuid())
  developerId     String
  developer       Developer  @relation(fields: [developerId], references: [id], onDelete: Cascade)

  hackathonId     String
  hackathon       Hackathon  @relation(fields: [hackathonId], references: [id], onDelete: Cascade)

  projectName     String
  repositoryUrl   String?
  placement       Int
  prizeAmount     Float?
  proofUrl        String

  isVerified      Boolean    @default(false)
  verifiedAt      DateTime?
  verifiedBy      String?
  submittedAt     DateTime   @default(now())
  rejectionReason String?    @db.Text

  @@index([developerId])
  @@index([hackathonId])
  @@index([isVerified])
}

model Grant {
  id              String       @id @default(uuid())
  name            String
  ecosystem       String
  provider        String
  amount          Float?
  websiteUrl      String
  deadline        DateTime?
  status          GrantStatus  @default(OPEN)

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  recipients      GrantRecipient[]

  @@index([ecosystem])
  @@index([status])
  @@index([deadline])
}

model GrantRecipient {
  id                String    @id @default(uuid())
  developerId       String
  developer         Developer @relation(fields: [developerId], references: [id], onDelete: Cascade)

  grantId           String
  grant             Grant     @relation(fields: [grantId], references: [id], onDelete: Cascade)

  projectName       String
  amountReceived    Float
  announcementUrl   String

  isVerified        Boolean   @default(false)
  verifiedAt        DateTime?
  verifiedBy        String?
  receivedAt        DateTime
  rejectionReason   String?   @db.Text
  createdAt         DateTime  @default(now())

  @@index([developerId])
  @@index([grantId])
  @@index([isVerified])
}

model OpenSourceContribution {
  id                  String           @id @default(uuid())
  developerId         String
  developer           Developer        @relation(fields: [developerId], references: [id], onDelete: Cascade)

  repositoryUrl       String
  repositoryName      String
  contributionType    String
  contributionCount   Int
  impactScore         Float

  lastSyncedAt        DateTime         @default(now())

  @@index([developerId])
  @@index([impactScore])
}
```

---

## API Endpoints

### Authentication
```
POST   /auth/register
POST   /auth/login
GET    /auth/github
POST   /auth/github/callback
GET    /auth/me
POST   /auth/refresh
```

### Developers
```
GET    /developers                    # List with filters
GET    /developers/:id                # Single profile
PATCH  /developers/me                 # Update own
GET    /developers/:id/projects
GET    /developers/:id/reputation
GET    /developers/:id/vouches
GET    /developers/:id/hall-of-fame
```

### Profile
```
GET    /profile/me
PATCH  /profile/me
POST   /profile/me/projects
PATCH  /profile/me/projects/:id
DELETE /profile/me/projects/:id
```

### Projects
```
GET    /projects
GET    /projects/:id
POST   /projects/validate
```

### Vouches
```
POST   /vouches
GET    /vouches/eligibility/:developerId
GET    /vouches/:developerId
DELETE /vouches/:id
GET    /vouches/my-vouches
```

### Jobs & Referrals
```
GET    /jobs
POST   /jobs
GET    /jobs/:id
PATCH  /jobs/:id
POST   /jobs/:id/interested
GET    /referrals/me
PATCH  /referrals/:id/status
```

### Alerts
```
GET    /alerts
PATCH  /alerts/:id/read
PATCH  /alerts/read-all
GET    /alerts/preferences
PATCH  /alerts/preferences
```

### Sessions
```
GET    /sessions
POST   /sessions
GET    /sessions/:id
POST   /sessions/:id/join
```

### Hall of Fame
```
GET    /hall-of-fame/hackathons
GET    /hall-of-fame/grants
GET    /hall-of-fame/opensource
POST   /hall-of-fame/hackathons
POST   /hall-of-fame/grants
```

### Admin
```
PATCH  /admin/hackathons/:id/verify
PATCH  /admin/grants/:id/verify
GET    /admin/pending-verifications
```

### GitHub
```
GET    /github/issues
POST   /github/sync
POST   /github/issues/:id/assign
GET    /github/profile/:username
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/web3_talent"
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-pat

EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@yourapp.com

PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL 15+ running locally
- Redis 7+ running locally
- GitHub OAuth App created

### Backend Setup
```bash
mkdir backend && cd backend
npx @nestjs/cli new . --package-manager pnpm

# Install dependencies
pnpm add @prisma/client bcrypt passport passport-jwt passport-github2
pnpm add class-validator class-transformer @nestjs/jwt @nestjs/passport
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
pnpm add bull @nestjs/bull redis ioredis
pnpm add @nestjs/config @octokit/rest resend

pnpm add -D @types/bcrypt @types/passport-jwt @types/passport-github2 prisma

# Initialize Prisma
npx prisma init
# Copy schema from above to prisma/schema.prisma
npx prisma generate
npx prisma migrate dev --name init

# Start backend
pnpm run start:dev
```

### Frontend Setup
```bash
cd .. && mkdir frontend && cd frontend
pnpm create next-app@latest . --typescript --tailwind --app --use-pnpm

# Install dependencies
pnpm add @tanstack/react-query axios socket.io-client
pnpm add react-hook-form @hookform/resolvers zod
pnpm add zustand recharts date-fns lucide-react

# Install shadcn/ui
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button card input label textarea select dialog dropdown-menu avatar badge tabs table toast form popover command separator skeleton alert sheet

# Start frontend
pnpm run dev
```

---

## Development Workflow

### NestJS Module Generation
```bash
cd backend
nest g module features/example
nest g controller features/example
nest g service features/example
nest g class features/example/dto/create-example.dto --no-spec
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev --name describe_changes
npx prisma generate
npx prisma db seed
```

### Code Examples

**NestJS Service Pattern:**
```typescript
@Injectable()
export class ExampleService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: FilterDto) {
    return this.prisma.example.findMany({
      where: this.buildWhereClause(filters),
      include: { relations: true },
    });
  }
}
```

**Next.js Client Component:**
```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
});

export function ExampleForm() {
  const form = useForm({ resolver: zodResolver(schema) });
  const onSubmit = async (data) => { /* logic */ };
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

**React Query Hook:**
```typescript
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export function useDevelopers(filters) {
  return useQuery({
    queryKey: ['developers', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/developers', { params: filters });
      return data;
    },
  });
}
```

---

## MVP Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Project setup (frontend + backend)
- Database schema implementation
- Authentication (email/password + GitHub OAuth)
- Basic user profiles
- Developer directory

### Phase 2: Core Features (Weeks 3-4)
- GitHub integration
- Project management
- Project validation
- Reputation calculation engine
- Tier assignment

### Phase 3: Vouching & Reputation (Weeks 5-6)
- Tier-based vouching system
- Vouch eligibility checks
- Reputation display
- Alert system
- Notification preferences

### Phase 4: Jobs & Matching (Weeks 7-8)
- Job posting
- Matching algorithm
- Referral workflow
- Interest tracking

### Phase 5: Community Features (Weeks 9-10)
- Hall of Fame pages
- Achievement submission
- Verification workflow
- Session scheduling
- GitHub issues integration

### Phase 6: Polish & Launch (Weeks 11-12)
- UI/UX refinement
- Performance optimization
- Testing
- Documentation
- Beta launch

---

## Future Enhancements

- AI-powered job-developer matching
- Skills assessment and coding challenges
- Reputation NFTs (on-chain tokens)
- DAO governance integration
- Mobile apps (iOS/Android)
- Video developer profiles
- Advanced analytics dashboards
- Multi-language support (i18n)
- Blockchain reputation tracking

---

**Version**: 1.0.0 | **Status**: In Development | **Updated**: December 2024

**Ignore the following but never remove them**
Order: Auth Module → DTOs → Profile/Developer Controllers → GitHub Integration → Reputation Engine
secret generation command - openssl rand -base64 32