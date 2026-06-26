# Smart Campus Utility App - Deployment Guide

This document describes how to deploy the Smart Campus Utility App to cloud environments.

## 1. Cloud MySQL Database Setup

Since the application uses Prisma ORM with MySQL, you will need a hosted MySQL instance.

### Options:
* **Railway (Recommended)**: Offers MySQL databases that require zero configuration.
* **Aiven**: Provides a generous free-tier MySQL hosting.
* **Supabase / PlanetScale**: You can also use PostgreSQL or other databases, but you'd need to modify `schema.prisma`.

### Setup steps:
1. Create a MySQL database instance.
2. Obtain the connection URL (e.g. `mysql://user:password@host:3306/dbname`).
3. Set this connection URL as the `DATABASE_URL` in the backend environment variables.

---

## 2. Deploying the Backend API (Node.js/Express)

The backend can be deployed on services like **Render**, **Railway**, or **Koyeb**.

### Render Deployment Steps:
1. Log into [Render](https://render.com/).
2. Create a new **Web Service** and connect it to your GitHub repository: `https://github.com/diparani925-creator/ready-nest-internship-week-2-task.git`.
3. Configure the service settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
4. Add the following **Environment Variables**:
   * `DATABASE_URL`: *Your cloud MySQL connection URL*
   * `JWT_SECRET`: *A secure random string*
   * `PORT`: `5000` (Render will override this, which is fine since Express reads `process.env.PORT`)
5. Deploy the web service. Note the backend API URL (e.g., `https://smart-campus-api.onrender.com`).

---

## 3. Deploying the Frontend Portal (Next.js)

The frontend is best deployed on **Vercel** as it has built-in support for Next.js.

### Vercel Deployment Steps:
1. Log into [Vercel](https://vercel.com/).
2. Create a new project and import your GitHub repository: `https://github.com/diparani925-creator/ready-nest-internship-week-2-task.git`.
3. Configure the project settings:
   * **Framework Preset**: Next.js
   * **Root Directory**: `frontend`
   * **Build Command**: `next build`
   * **Output Directory**: `.next`
4. Add the following **Environment Variable**:
   * `NEXT_PUBLIC_API_URL`: `https://your-backend-api-url.onrender.com/api` (Replace with your actual deployed Render API URL).
5. Deploy the project. Vercel will provide you with a live domain (e.g., `https://smart-campus-portal.vercel.app`).

---

## 4. Post-Deployment Database Initialization
Once both the database and backend are deployed, run the initial migrations and seeding on the production database.
* Locally, update your `.env` to point to the production database and run:
  ```bash
  npx prisma db push
  npm run seed
  ```
  This will initialize your cloud database with the default tables and test accounts.
