# Supabase Auth Portal

A modern login and onboarding flow for Supabase Auth, built with Next.js 14 and React 18. The UI includes sign-in, sign-up, password reset, and session management with a glassmorphism-inspired design ready to deploy to Vercel.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` and provide your Supabase project credentials (see `.env.local.example`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` and interact with the auth flow.

## Deploying to Vercel

1. Ensure the environment variables above are configured in your Vercel project.
2. Build and deploy:
   ```bash
   npm run build
   npm run start # optional local production smoke test
   vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-71cea35c
   ```
3. After deployment, verify the production URL:
   ```bash
   curl https://agentic-71cea35c.vercel.app
   ```

## Project Structure

```
├── app/
│   ├── layout.tsx        # Root layout importing global styles
│   ├── page.tsx          # Home route rendering the auth experience
│   └── globals.css       # Application-level styling
├── components/
│   └── AuthForm.tsx      # Complete Supabase auth flow UI + logic
├── lib/
│   └── supabaseClient.ts # Lazy-initialized Supabase client helper
├── package.json
├── tsconfig.json
└── .env.local.example
```

## Features

- Email/password sign-in and sign-up with Supabase
- Password reset email flow with redirect placeholder
- Session persistence with live auth state updates
- Sign-out controls and success/error messaging
- Responsive, accessible UI ready for theming

## Notes

- Configure redirect URLs (e.g., `/confirm`, `/reset`) in your Supabase Authentication settings.
- For local password reset testing, set redirect URLs to a reachable address (localhost is supported in Supabase dashboard).
- The demo focuses on client-side flows; augment with server-side route protection as needed.
