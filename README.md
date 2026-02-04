# Rock Gym UI

A React.js frontend application for the Rock Gym Management System.

## Architecture

This is a **disconnected frontend** that communicates with the Spring Boot backend via REST APIs.

- **Frontend**: React.js (Port 3000)
- **Backend**: Spring Boot (Port 9090)
- **Communication**: HTTP REST API calls

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Make sure the Spring Boot backend is running on `http://localhost:9090`

## Features

- Member Management
- Attendance Tracking
- Payment Management
- Reports & Analytics
- Birthday Management
- Holiday Management
- WhatsApp Notifications

## API Configuration

The app connects to the Spring Boot API at:
- Base URL: `http://localhost:9090/rockgymapp/api`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API service functions
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
└── App.js         # Main app component
```