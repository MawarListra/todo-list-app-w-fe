# Todo List Web Application

A modern, responsive todo list web application built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ Create and manage todo lists
- ✅ Add, edit, and delete tasks
- ✅ Set task priorities and due dates
- ✅ Dashboard with analytics
- ✅ Search and filter functionality
- ✅ Responsive design for all devices
- ✅ Progressive Web App (PWA) support
- ✅ Offline functionality
- ✅ Accessibility compliant (WCAG 2.1 AA)

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library + Playwright
- **Documentation**: Storybook

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on localhost:3001

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Documentation
npm run storybook    # Start Storybook
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Basic UI components
│   ├── layout/          # Layout components
│   ├── features/        # Feature-specific components
│   │   ├── lists/       # List management
│   │   ├── tasks/       # Task management
│   │   ├── dashboard/   # Dashboard
│   │   └── analytics/   # Analytics
│   ├── forms/           # Form components
│   └── feedback/        # Toast, Loading, Error
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── stores/              # State management
├── utils/               # Utility functions
├── types/               # TypeScript types
├── pages/               # Page components
├── styles/              # Global styles
└── constants/           # App constants
```

## API Integration

The frontend connects to the backend API running on `localhost:3001`. All API calls are proxied through Vite's development server.

## Testing Strategy

- **Unit Tests**: Components, hooks, and utilities
- **Integration Tests**: Feature workflows and API integration
- **E2E Tests**: Complete user journeys
- **Visual Tests**: Component visual regression with Storybook

## Accessibility

This application follows WCAG 2.1 AA guidelines:

- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes
- Focus management
- ARIA labels and roles

## Performance

- Code splitting and lazy loading
- Virtual scrolling for large lists
- Optimized bundle size
- Progressive Web App features
- Offline functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure accessibility compliance
4. Update documentation as needed

## License

MIT License
