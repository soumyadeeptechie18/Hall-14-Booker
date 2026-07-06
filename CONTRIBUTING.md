# Contributing to Hall-14-Booker

Welcome! This guide will walk you through setting up the project on your local machine using VS Code, configuring the necessary environment variables, getting Google Authentication working, and submitting your changes.

## Prerequisites
- **Node.js** (v18 or higher)
- **Git**
- **Visual Studio Code (VS Code)**
- Access to the project's Supabase environment variables (ask the project owner).

## 1. Clone the Repository
First, clone the repository to your local machine and open it in VS Code:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd hall-14-booker
code .
```

## 2. Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + \`` or `Cmd + \``) and run:
```bash
npm install
```

## 3. Environment Variables & Supabase Setup
The application uses Supabase for its backend database and Google Authentication. 

1. Create a file named `.env` in the root directory.
2. Copy the structure from `.env.example` (or use the template below):
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
3. Request the actual Supabase URL and Anon Key from the project owner and paste them into your `.env` file. Do NOT commit the `.env` file to GitHub (it is ignored by `.gitignore`).

## 4. Google Authentication (Localhost Config)
For Google Login to work on your local machine, the project owner MUST authorize your local server URL in Supabase.

1. Start your local server (see step 5) and check the port (usually `http://localhost:5173` or `http://localhost:3000`).
2. Ask the project owner to go to their **Supabase Dashboard** -> **Authentication** -> **URL Configuration** -> **Redirect URLs**.
3. Have them add your localhost URL (e.g., `http://localhost:5173/`) to the list.
*If this is not done, Google login will throw a redirect error when testing locally.*

## 5. Run the Local Server
Start the development server:
```bash
npm run dev
```
Click the local link shown in the terminal (e.g., `http://localhost:5173`) to view the app in your browser. Any changes you make in VS Code will automatically reload in the browser!

## 6. How to Contribute
We use standard GitHub flow for collaboration:

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Make your code changes in VS Code.
3. Commit your changes with a clear message:
   ```bash
   git add .
   git commit -m "Add new dashboard feature"
   ```
4. Push to your branch on GitHub:
   ```bash
   git push origin feature/my-new-feature
   ```
5. Go to the GitHub repository and open a **Pull Request (PR)** to merge your changes into the `main` branch. The project owner can then review and merge your code!
