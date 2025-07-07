<strong>**DO NOT DISTRIBUTE OR PUBLICLY POST SOLUTIONS TO THESE LABS. MAKE ALL FORKS OF THIS REPOSITORY WITH SOLUTION CODE PRIVATE. PLEASE REFER TO THE STUDENT CODE OF CONDUCT AND ETHICAL EXPECTATIONS FOR COLLEGE OF INFORMATION TECHNOLOGY STUDENTS FOR SPECIFICS. **</strong>

# WESTERN GOVERNORS UNIVERSITY

## D424 – SOFTWARE ENGINEERING CAPSTONE

By: Zachary Pfizenmaier

Welcome to StatusDeck!

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Working with the Database

This project uses the [Supabase CLI](https://supabase.com/docs/guides/cli) to manage database schema changes through migrations.

### Initial Setup

1.  **Link your local environment to your Supabase project.** You will need your project's reference ID, which can be found in the URL of your Supabase dashboard (`https://app.supabase.com/project/<your-project-ref-id>`).

    ```bash
    npx supabase link --project-ref <your-project-ref-id>
    ```

    You will be prompted to enter your database password.

### Creating a New Migration

1.  **Create a new migration file.** Use a descriptive name for your migration.

    ```bash
    npx supabase migration new <your_migration_name>
    ```

    This will create a new SQL file in the `supabase/migrations` directory.

2.  **Add your SQL changes.** Open the newly created SQL file and add your `CREATE TABLE`, `ALTER TABLE`, or other SQL statements.

3.  **Apply the migration.** To apply the changes to your remote Supabase database, run the following command:

    ```bash
    npx supabase db push
    ```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
