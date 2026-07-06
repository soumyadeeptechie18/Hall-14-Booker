# Hall-14-Booker

A modern, full-stack web application designed to facilitate room bookings for Hall 14. It allows students to log in, form a group of three, and select their preferred room from an interactive dashboard.

## 🚀 Features

- **Secure Authentication:** Users log in using their Google account, powered by Supabase Authentication.
- **Student Database Integration:** Seamlessly search and validate students by their Registration Number to ensure only valid residents are booked.
- **Group Booking System:** Book a room for yourself and two other roommates simultaneously.
- **Interactive Floor Map:** A visual dashboard that allows users to select floors (2 through 8) and view real-time availability of rooms.
- **Live Dashboard & Details:** Click on any reserved room to view detailed information, including who booked the room, their email, and the registered roommates.
- **Real-time State Management:** Prevents double-booking by filtering out students who have already been assigned a room.

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS for a highly responsive, modern UI
- **Icons:** Lucide React
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google Provider)

## 🏗️ How It Works (Architecture)

1. **Authentication:** When a user arrives, they are prompted to log in using Google. The session is managed by Supabase and persisted locally.
2. **Booking Flow:**
   - The user searches for their own registration number and their two roommates from the pre-loaded student database (`src/data/students.ts`).
   - The system checks if any of the selected students are already booked.
   - The user selects a floor and an available room.
   - The booking is saved to the Supabase database.
3. **Live Dashboard:** 
   - The dashboard fetches all bookings from Supabase.
   - It visually represents the 40 rooms per floor, marking them as either "Available" or showing the names of the students if "Reserved".
   - Clicking a reserved room opens a modal with detailed booking information.

## 💻 Workflow for Developers

If you want to contribute or run this project locally, follow these steps:

### 1. Local Setup
1. Clone the repository via Git.
2. Run `npm install` to install all dependencies.
3. Create a `.env` file in the root directory based on `.env.example` and add the Supabase URL and Anon Key.
4. Run `npm run dev` to start the local development server.

*(For a detailed step-by-step guide, please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file).*

### 2. Project Structure
- `/src/components/`: Contains modular UI components like `Dashboard`, `RoomSelector`, and `StudentSearch`.
- `/src/data/`: Contains static data, such as the student database.
- `/src/lib/`: Contains utility configurations, such as the `supabase.ts` client setup.
- `/src/App.tsx`: The main entry point that manages the state of the application, routing between the booking view and the dashboard view.

### 3. Database Schema (Supabase)
The application relies on a `bookings` table with the following structure:
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `user_email` (text)
- `student_reg` (text)
- `roommate1_reg` (text)
- `roommate2_reg` (text)
- `room_number` (text)
- `floor` (integer)
- `created_at` (timestamp)

### 4. Making Changes
- We use the standard GitHub flow. Create a feature branch, make your changes, and submit a Pull Request.
- Ensure all Tailwind classes are used efficiently and components are kept modular.
- If modifying database schemas, ensure you update `src/types.ts` to reflect the new TypeScript interfaces.
