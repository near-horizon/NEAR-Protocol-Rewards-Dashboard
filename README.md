# NEAR Protocol Rewards Dashboard

A transparent, metric-based rewards system for NEAR projects that directly ties incentives to development activity and user adoption. This dashboard provides real-time insights into repository metrics and rewards distribution across the NEAR ecosystem.

## 🚀 Features

- **Real-time Metrics Tracking**
  - Repository activity monitoring
  - Developer contribution analytics
  - Reward level calculations
  - Historical data visualization

- **Interactive Dashboard**
  - Activity heatmaps
  - Repository performance stats
  - Sortable repository list
  - Search and filtering capabilities

- **Modern UI/UX**
  - Responsive design
  - Dark/light mode support
  - Interactive data visualizations
  - Real-time updates

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: TailwindCSS
- **Data Visualization**: Recharts, React Heat Map
- **API Integration**: GitHub API (Octokit)
- **Database**: Supabase
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub account
- Supabase account

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/near-horizon/NEAR-Protocol-Rewards-Dashboard.git
   cd NEAR-Protocol-Rewards-Dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GITHUB_TOKEN=your_github_personal_access_token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Quick Start for Projects

1. Initialize your repository:
   ```bash
   npx near-protocol-rewards init
   ```

2. Push to main branch to start tracking contributions

3. Join the community and share your progress

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint


## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=           # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Your Supabase anonymous key
VITE_GITHUB_TOKEN=           # Your GitHub personal access token
```

## 🏗️ Project Structure

```bash
src/
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and API clients
├── pages/             # Page components
└── types/             # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.