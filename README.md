# Project Management Application

A full-stack project management application built with React, Node.js, and MongoDB.

## Features

- Project creation and management
- Team collaboration
- Task tracking with milestones
- Budget management
- Progress tracking
- Real-time updates
- Responsive design

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Chakra UI
  - React Hook Form

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication

## Deployment Links

- Frontend: [Vercel](https://track3d-aii.vercel.app)
- Backend: [Render](https://track3d-backend.onrender.com)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/venuvinay/TRACK3D.AII.git
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
Create `.env` files in both frontend and backend directories with the necessary environment variables.

4. Run the development servers:
```bash
# Run frontend
cd frontend
npm run dev

# Run backend
cd ../backend
npm run dev
```

## Deployment Instructions

### Vercel (Frontend)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist` or `build`
   - Install Command: `npm install`

### Render (Backend)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure service settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 