# Resume-IQ

Resume-IQ is a full-stack resume and career-assistance platform. It helps users build structured CVs, import existing resume content, analyze resumes, compare a CV with a vacancy, improve written content with AI, and track relevant job opportunities.

The application includes a browser-based CV builder with live templates and PDF export, an Express API for authentication and career tools, and PostgreSQL storage for users, CVs, documents, job matches, plans, and payments.

## Main features

- CV builder with live previews, multiple templates, section ordering, entry ordering, and PDF export.
- Resume import and analysis for supported document uploads.
- Vacancy matching and CV tailoring tools.
- AI-assisted summaries, descriptions, skills, grammar checking, interview answers, and cover letters.
- Project import from public GitHub or GitLab README files and uploaded Markdown files.
- Job Radar preferences, matches, application statuses, analytics, and CV variants.
- Email/password authentication, email verification, Google OAuth, profiles, and saved CVs.
- English and Arabic interfaces.
- Credit, subscription, InstaPay review, blog, and administrative workflows.

## Technology stack

### Frontend

- React 19 and TypeScript
- Vite 6
- Material UI 7 and Emotion
- Redux Toolkit and React Redux
- React Router
- React Hook Form and Zod
- Axios
- i18next and react-i18next
- Framer Motion
- `@react-pdf/renderer`

### Backend

- Node.js and TypeScript
- Express 5
- PostgreSQL
- Prisma ORM
- Groq-hosted Llama models through the OpenAI-compatible SDK
- Zod
- JSON Web Tokens, Passport, and Google OAuth 2.0
- Multer, `pdf-parse`, Mammoth, and `docx` for document handling
- Cloudinary for uploaded media
- Nodemailer for email
- Helmet, CORS, cookie-parser, and express-rate-limit
- Jest and Supertest

## Repository structure

```text
Resume-IQ/
|-- FRONTEND/   React application, CV builder, templates, pages, and state
|-- BACKEND/    Express API, Prisma schema, services, routes, and middleware
`-- README.md
```

## Local setup

### Requirements

- Node.js and npm
- PostgreSQL
- A Groq API key for AI-backed features
- Google OAuth, Cloudinary, and email credentials for their related features

### Backend

```bash
cd BACKEND
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Create `BACKEND/.env` before starting the API:

```dotenv
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/resume_iq
CLIENT_URL=http://localhost:5173

JWT_SECRET_Key=replace_me
SESSION_SECRET=replace_me

GROQ_API_KEY=replace_me
# Optional additional Groq keys used for rate-limit fallback:
# GROQ_API_KEY_2=replace_me
# GROQ_API_KEY_3=replace_me

GOOGLE_CLIENT_ID=replace_me
GOOGLE_CLIENT_SECRET=replace_me
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

CLOUDINARY_CLOUD_NAME=replace_me
CLOUDINARY_API_KEY=replace_me
CLOUDINARY_API_SECRET=replace_me

EMAIL_HOST=replace_me
EMAIL_PORT=587
EMAIL_USER=replace_me
EMAIL_PASS=replace_me

ADMIN_EMAIL=admin@example.com
ADMIN_SECRET=replace_me

INSTAPAY_BANK_NAME=replace_me
INSTAPAY_ACCOUNT_NAME=replace_me
INSTAPAY_ACCOUNT_NUMBER=replace_me
```

The backend validates its required environment variables during startup. AI features additionally need at least one configured Groq key.

### Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

The frontend defaults to `http://localhost:3001`. To use another API origin, create `FRONTEND/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:3001
```

Vite serves the frontend on `http://localhost:5173` by default.

## Available commands

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Backend:

```bash
npm run dev
npm run build
npm start
npm test
npm run seed:admin
```

`npm run seed:admin` reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`, or accepts the email and password as command-line arguments.
