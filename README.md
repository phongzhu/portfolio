# Portfolio catalog

A portfolio landing page and private admin studio built with React and Supabase. Visitors can browse published work without an account. The owner can sign in to manage projects, profile details, and visual settings.

## Supabase setup

1. Log in and link this checkout to your Supabase project, then run `supabase db push --linked` to apply the migrations in order.
2. In **Authentication → Users**, create or confirm the owner account and set its password there. Login credentials are not stored in this app.
3. Grant that existing Auth account the admin role in the SQL Editor:

   ```sql
   insert into private.portfolio_admins (user_id)
   select id from auth.users where lower(email) = lower('you@example.com')
   on conflict do nothing;
   ```

4. The local `.env.local` is ignored by Git and contains the Supabase project URL and publishable key. For another checkout, copy `.env.example` to `.env.local` and fill in those two values.
5. Start the portfolio with `npm start` and open **Admin** in the top navigation to sign in. A valid owner session opens the full-screen dashboard directly.

The migration enables row-level security on every portfolio table. Only the owner account added to `private.portfolio_admins` can write content or upload images. Project image uploads require at least two images. Visitors can read published projects and UI settings.

## Scripts

- `npm start` runs the development site at `http://localhost:3000`.
- `npm run build` creates an optimized production bundle.
