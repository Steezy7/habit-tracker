# Daily Bloom - Habit Tracker

A beautiful and intuitive habit tracking application built with React, TypeScript, and Tailwind CSS. Daily Bloom helps you build consistent routines and track your progress with a clean, modern interface.

## Features

- **Daily Habit Tracking**: Check off your habits daily and see your progress
- **Calendar View**: Visualize your habit completion history over time
- **Progress Dashboard**: Track your streaks and completion rates
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure user authentication with Supabase
- **Real-time Updates**: Instant feedback and smooth animations

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Testing**: Vitest, Playwright

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun
- Supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd daily-bloom
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   bun install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Configure your Supabase credentials in the `.env` file.

4. Start the development server:

   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Create an Account**: Sign up with your email and password
2. **Add Your First Habit**: Click the "+" button to create a new habit
3. **Track Daily**: Check off completed habits each day
4. **View Progress**: Switch between Today, Calendar, and Progress views
5. **Stay Consistent**: Build streaks and watch your progress grow

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── habit/          # Habit-specific components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── store/              # State management
└── lib/                # Utilities and configurations
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
