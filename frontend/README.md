# JobPortal Frontend

A modern, professional job portal frontend built with React, Vite, and Tailwind CSS. Features dark/light theme toggle and seamless integration with the backend API.

## Features

- ✨ **Dark/Light Theme Toggle** - Professional dark mode with smooth transitions
- 🎨 **Modern UI Design** - Inspired by Naukri, LinkedIn with professional styling
- 🔐 **Authentication System** - Register, login, and profile management
- 💼 **Job Listings** - Browse jobs with advanced filters
- 🔍 **Search & Filter** - Search by title, location, and job type
- 📱 **Responsive Design** - Mobile-first approach with full responsiveness
- ⚡ **Lightning Fast** - Vite for instant HMR and optimized builds
- 🎯 **State Management** - Zustand for lightweight state management

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Routing**: React Router v6

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── JobsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── store/
│   │   ├── authStore.js      (Authentication state)
│   │   └── themeStore.js     (Dark/Light theme state)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm installed
- Backend API running on `http://localhost:5000`

### Installation

```bash
cd frontend
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Environment Configuration

The frontend connects to the backend API at `http://localhost:5000`. This is configured in `vite.config.js` with a proxy setup for API calls.

### API Endpoints

- **Base URL**: `http://localhost:5000/api`
- **Authentication**:
  - `POST /auth/register` - User registration
  - `POST /auth/login` - User login
  - `GET /auth/profile` - Get user profile
  - `PUT /auth/profile` - Update user profile
- **Jobs**:
  - `GET /jobs` - Fetch all jobs
  - `POST /jobs` - Create a job (recruiter only)
  - `PUT /jobs/:id` - Update a job (recruiter only)
- **Companies**:
  - `GET /companies` - Fetch all companies
  - `POST /companies` - Create a company
  - `PUT /companies/:id` - Update a company
- **Applications**:
  - `POST /applications` - Submit an application
  - `GET /applications` - Get user applications
  - `PUT /applications/:id/status` - Update application status

## Features Explained

### Dark/Light Theme

The theme toggle is accessible from the Navbar. Theme preference is persisted in localStorage:

```javascript
// Using the theme store
import { useThemeStore } from './store/themeStore'

const { isDark, toggleTheme } = useThemeStore()

<button onClick={toggleTheme}>
  {isDark ? <Sun /> : <Moon />}
</button>
```

### Authentication

Login and registration are managed through Zustand store:

```javascript
import { useAuthStore } from './store/authStore'

const { login, register, logout, user, isAuthenticated } = useAuthStore()

// Login
await login(email, password)

// Register
await register({ name, email, password, role })

// Logout
logout()
```

## Demo Credentials

Use these credentials to test the application:

**Candidate:**
- Email: `alex.candidate@example.com`
- Password: `securepassword123`

**Recruiter:**
- Email: `sarah.recruiter@example.com`
- Password: `securepassword123`

## Backend Integration

The frontend communicates with the backend API without modifying any backend logic. All requests include the JWT token in the Authorization header:

```javascript
Authorization: Bearer <JWT_TOKEN>
```

Token is automatically managed by the `authStore` and attached to all authenticated requests via Axios interceptors.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Fast development server with Vite's HMR
- Optimized production builds
- Lazy loading of routes
- Efficient state management with Zustand
- Tailwind CSS purging for minimal CSS bundle

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for finding dream jobs**
