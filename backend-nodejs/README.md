// README.md
# EHR Backend - Node.js Version

A Node.js/Express.js backend for the Electronic Health Records (EHR) system with Firebase integration, role-based access control, and comprehensive logging.

## Project Structure

```
backend-nodejs/
├── app.js                    # Main Express application
├── config.js                 # Configuration settings
├── firebase.js               # Firebase initialization
├── utils.js                  # Utility functions
├── limiter.js                # Rate limiting configuration
├── middleware.js             # Express middleware
├── encryption.js             # Encryption/decryption utilities
├── trustLogic.js             # Trust score calculation
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── routes/
    ├── authRoutes.js         # Authentication endpoints
    ├── userRoutes.js         # User management endpoints
    ├── patientRoutes.js      # Patient record endpoints
    ├── accessRoutes.js       # Access control endpoints
    ├── logsRoutes.js         # Logging endpoints
    └── generalRoutes.js      # General utility endpoints
```

## Features

### Authentication
- OTP-based login system
- Admin verification
- Firebase ID token validation
- Session management

### User Management
- User profile management
- Role-based access control (Doctor, Nurse, Patient)
- User listing and deletion

### Patient Records
- Create, read, update, and delete patient records
- Medical history tracking
- Emergency contact information

### Access Control
- Access request system
- Emergency access grants
- Access approval/denial workflow
- Trust-based access scoring

### Logging & Monitoring
- Comprehensive access logging
- User activity tracking
- Date range filtering
- Dashboard statistics

### Security
- Rate limiting (login, OTP, general)
- Encryption for sensitive data
- CORS configuration
- JWT token support

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- Firebase project setup

### Setup Steps

1. **Clone and navigate to backend directory**
   ```bash
   cd backend-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` with your Firebase credentials and settings:
   ```
   PORT=5000
   NODE_ENV=development
   FIREBASE_CONFIG_PATH=./firebase_config.json
   ADMIN_EMAIL=admin@ehr.com
   ```

5. **Add Firebase configuration**
   Place your Firebase service account JSON file as `firebase_config.json` in the project root.

## Running the Server

### Development Mode
```bash
npm run dev
```
Uses nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

### Check Health
```bash
curl http://localhost:5000/health
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /admin/login` - Admin login verification
- `POST /user_login` - Send OTP to user email
- `POST /verify_otp` - Verify OTP and create session
- `POST /resend_otp` - Resend OTP to email
- `POST /logout` - Logout user

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /all` - List all users (admin)
- `DELETE /account` - Delete user account

### Patients (`/api/patients`)
- `GET /` - List all patients
- `POST /` - Create patient record
- `GET /:patientId` - Get patient record
- `PUT /:patientId` - Update patient record
- `DELETE /:patientId` - Delete patient record

### Access Control (`/api/access`)
- `POST /request` - Request access to patient record
- `PUT /:requestId/approve` - Approve access request
- `PUT /:requestId/deny` - Deny access request
- `POST /emergency` - Grant emergency access
- `GET /patient/:patientId` - Get access requests for patient

### Logs (`/api/logs`)
- `GET /` - Get all access logs
- `GET /user/:userId` - Get logs for specific user
- `GET /patient/:patientId` - Get logs for specific patient
- `POST /` - Create access log
- `GET /date-range/:startDate/:endDate` - Get logs for date range

### General (`/api/general`)
- `GET /health` - Health check
- `GET /stats` - System statistics
- `GET /dashboard` - Dashboard data
- `GET /system-info` - System information

## Rate Limiting

The API implements different rate limits:
- **General**: 100 requests per 15 minutes
- **Login**: 5 requests per minute (per IP)
- **OTP**: 3 requests per 10 minutes
- **Admin**: 50 requests per 15 minutes

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Additional details (in development mode)"
}
```

## Firebase Setup

1. Create a Firebase project
2. Enable Firestore database
3. Generate service account credentials
4. Download JSON and save as `firebase_config.json`

### Required Firestore Collections
- `users` - User profiles
- `patients` - Patient records
- `access_requests` - Access control requests
- `emergency_access` - Emergency access grants
- `access_logs` - Access audit logs

## Environment Variables

```
PORT                 - Server port (default: 5000)
NODE_ENV             - Environment (development/production)
FLASK_ENV            - Flask environment (for compatibility)
FIREBASE_CONFIG_PATH - Path to Firebase credentials
ADMIN_EMAIL          - Administrator email address
TRUST_THRESHOLD      - Minimum trust score for auto-approval
TRUSTED_NETWORK      - CIDR network for trusted IPs
SMTP_SERVER          - Email server (Gmail SMTP)
SMTP_PORT            - Email server port
EMAIL_SENDER         - Sender email address
EMAIL_PASSWORD       - Email app password
ENCRYPTION_KEY       - 32-character encryption key
JWT_SECRET           - JWT signing secret
```

## Security Considerations

1. **Environment Variables**: Keep sensitive data in `.env` file
2. **Firebase Rules**: Configure proper Firestore security rules
3. **CORS**: Adjust origins based on deployment
4. **Rate Limiting**: Adjust limits based on requirements
5. **Encryption**: Use strong encryption keys
6. **Email**: Use app-specific passwords for email services

## Development

### Code Structure
- Follow existing naming conventions
- Use async/await for database operations
- Include error handling and logging
- Return consistent JSON responses

### Testing
```bash
npm test
```

### Debugging
Enable debug logging:
```bash
DEBUG=* npm run dev
```

## Deployment

### Render/Heroku
1. Set environment variables
2. Deploy using git push
3. Ensure Firebase config is accessible

### Docker (Optional)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t ehr-backend .
docker run -p 5000:5000 ehr-backend
```

## Troubleshooting

### Firebase Not Initialized
- Check `firebase_config.json` path
- Verify service account credentials
- Check Firebase project settings

### Email Not Sending
- Verify SMTP credentials
- Use app-specific password (not account password)
- Check firewall/port settings

### Database Errors
- Verify Firestore security rules
- Check collection names
- Ensure proper field indexing

## License
ISC

## Support
For issues and questions, contact the development team.
