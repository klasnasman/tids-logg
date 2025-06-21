### Project Name

A small side project to register and visualize the hours I work.  
Built with [Astro](https://astro.build), [Supabase](https://supabase.com), and TailwindCSS.

You can register a user and try the site out at:  
[https://tids-logg.netlify.app/](https://tids-logg.netlify.app/)

#### Getting Started

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Supabase

##### Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project.

##### Get Your Supabase Credentials

1. Navigate to your project → **Project Settings** → **API**
2. Copy the **Project URL** and **anon public key**

##### Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Supabase credentials:
   ```env
   SUPABASE_URL=your_project_url_here
   SUPABASE_ANON_KEY=your_anon_key_here
   ```

##### Set Up Database Schema

1. Go to your Supabase project dashboard → **SQL Editor**
2. Open the file `20250514081116_polished_ocean.sql` in this repository
3. Copy all the SQL content and paste it into the SQL Editor
4. Click **"RUN"** to execute and create all tables, indexes, and policies

#### 4. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) in your browser.

#### Quick Summary

1. Clone the repo and install dependencies
2. Create a Supabase project and get your API keys
3. Copy `.env.example` to `.env` and fill in your credentials
4. Run the provided SQL migration in Supabase
5. Start the development server and begin development!
