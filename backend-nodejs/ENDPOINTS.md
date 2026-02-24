# EMS-Access-Control Backend - Complete Endpoint Reference

## Overview
This document lists all implemented endpoints for the Node.js backend. All endpoints are accessible via both `/api/` prefix (REST API) and direct paths (legacy compatibility).

---

## Authentication Endpoints (`/api/auth` or `/auth`)

### POST `/user_login`
- **Description**: User login with OTP generation
- **Body**: `{ name: string, role: string, email: string }`
- **Response**: `{ success: boolean, message: string, sessionId: string }`
- **Rate Limited**: Yes (5 requests per minute)

### POST `/admin/login`
- **Description**: Admin verification via Firebase token
- **Header**: `Authorization: Bearer <firebase-token>`
- **Response**: `{ success: boolean, message: string }`

### POST `/verify_otp`
- **Description**: Verify OTP and create user record
- **Body**: `{ email: string, otp: string }`
- **Response**: `{ success: boolean, message: string, user: object }`

### POST `/resend_otp`
- **Description**: Resend OTP to email
- **Body**: `{ email: string }`
- **Response**: `{ success: boolean, message: string }`
- **Rate Limited**: Yes (3 requests per 10 minutes)

### POST `/logout`
- **Description**: User logout
- **Body**: `{ email: string }`
- **Response**: `{ success: boolean, message: string }`

---

## User Management Endpoints (`/api/users`)

### GET `/profile`
- **Description**: Get current user profile
- **Auth**: Required (Firebase token)
- **Response**: `{ success: boolean, user: object }`

### PUT `/profile`
- **Description**: Update user profile
- **Auth**: Required
- **Body**: `{ name?: string, phone?: string, department?: string }`
- **Response**: `{ success: boolean, message: string, user: object }`

### GET `/all`
- **Description**: Get all users
- **Auth**: Required
- **Response**: `{ success: boolean, users: array, count: number }`

### DELETE `/account`
- **Description**: Delete user account
- **Auth**: Required
- **Response**: `{ success: boolean, message: string }`

### DELETE `/delete_user/:email`
- **Description**: Delete user by email (Admin)
- **Response**: `{ success: boolean, message: string }`

### GET `/get_all_users` (Direct Path)
- **Description**: Alias for `/all` - Get all users
- **Response**: `{ success: boolean, users: array, count: number }`

---

## Patient Management Endpoints (`/api/patients`)

### POST `/`
- **Description**: Create patient record
- **Auth**: Optional
- **Body**: `{ patientName: string, age: number, gender: string, medicalHistory?: array, emergencyContact?: object }`
- **Response**: `{ success: boolean, message: string, patientId: string, patient: object }`

### POST `/add_patient` (Direct Path)
- **Description**: Alias for patient creation
- **Body**: `{ patientName: string, age: number, gender: string, medicalHistory?: array, emergencyContact?: object }`
- **Response**: `{ success: boolean, message: string, patientId: string, patient: object }`

### GET `/`
- **Description**: Get all patients
- **Auth**: Optional
- **Response**: `{ success: boolean, patients: array, count: number }`

### GET `/:patientId`
- **Description**: Get specific patient record
- **Auth**: Optional
- **Response**: `{ success: boolean, patient: object }`

### PUT `/:patientId`
- **Description**: Update patient record
- **Auth**: Optional
- **Body**: `{ patientName?: string, age?: number, gender?: string, medicalHistory?: array, emergencyContact?: object }`
- **Response**: `{ success: boolean, message: string, patient: object }`

### POST `/update_patient` (Direct Path)
- **Description**: Alias for patient update
- **Body**: `{ patientId: string, ...updateFields }`
- **Response**: `{ success: boolean, message: string, patient: object }`

### GET `/all_patients` (Direct Path)
- **Description**: Alias for getting all patients
- **Response**: `{ success: boolean, patients: array, count: number }`

### DELETE `/:patientId`
- **Description**: Delete patient record
- **Auth**: Optional
- **Response**: `{ success: boolean, message: string }`

---

## Access Control Endpoints (`/api/access`)

### POST `/request`
- **Description**: Request access to patient record
- **Auth**: Required
- **Body**: `{ patientId: string, accessType: string, reason?: string }`
- **Response**: `{ success: boolean, message: string, requestId: string, request: object }`

### POST `/doctor_access` (Direct Path)
- **Description**: Doctor access request
- **Body**: `{ name: string, patientId: string, reason?: string }`
- **Response**: `{ success: boolean, message: string, requestId: string }`

### POST `/nurse_access` (Direct Path)
- **Description**: Nurse access request
- **Body**: `{ name: string, patientId: string, reason?: string }`
- **Response**: `{ success: boolean, message: string, requestId: string }`

### PUT `/:requestId/approve`
- **Description**: Approve access request
- **Auth**: Required
- **Response**: `{ success: boolean, message: string }`

### PUT `/:requestId/deny`
- **Description**: Deny access request
- **Auth**: Required
- **Body**: `{ reason?: string }`
- **Response**: `{ success: boolean, message: string }`

### POST `/emergency`
- **Description**: Grant emergency access
- **Auth**: Required
- **Body**: `{ patientId: string, reason: string }`
- **Response**: `{ success: boolean, message: string, accessId: string, access: object }`

### GET `/patient/:patientId`
- **Description**: Get access requests for patient
- **Auth**: Required
- **Response**: `{ success: boolean, requests: array, count: number }`

### GET `/precheck`
- **Description**: Pre-check access permission
- **Query**: `patientId, userId`
- **Response**: `{ success: boolean, hasAccess: boolean, message: string }`

---

## Logging Endpoints (`/api/logs`)

### GET `/`
- **Description**: Get all access logs
- **Query**: `limit=100, offset=0`
- **Auth**: Required
- **Response**: `{ success: boolean, logs: array, count: number }`

### POST `/`
- **Description**: Log access event
- **Auth**: Required
- **Body**: `{ userId: string, action: string, patientId?: string, details?: object }`
- **Response**: `{ success: boolean, message: string, logId: string, log: object }`

### GET `/user/:userId`
- **Description**: Get logs for specific user
- **Auth**: Required
- **Query**: `limit=50`
- **Response**: `{ success: boolean, logs: array, count: number }`

### GET `/patient/:patientId`
- **Description**: Get logs for specific patient
- **Auth**: Required
- **Query**: `limit=50`
- **Response**: `{ success: boolean, logs: array, count: number }`

### GET `/date-range/:startDate/:endDate`
- **Description**: Get logs for date range
- **Auth**: Required
- **Response**: `{ success: boolean, logs: array, count: number }`

### POST `/log_access` (Direct Path)
- **Description**: Alias for logging access
- **Body**: `{ name: string, role: string, patientId: string, action?: string, reason?: string, ip?: string }`
- **Response**: `{ success: boolean, message: string, logId: string }`

---

## General Endpoints (`/api/general`)

### GET `/health`
- **Description**: Server health check
- **Response**: `{ status: string, firebase: string, environment: string, timestamp: string }`

### GET `/ip_check` (Direct Path)
- **Description**: Get client IP address
- **Response**: `{ success: boolean, ip: string, timestamp: string }`

### GET `/stats`
- **Description**: Get system statistics
- **Response**: `{ success: boolean, stats: { totalUsers, totalPatients, totalAccessLogs, totalAccessRequests, timestamp } }`

### GET `/trust_score/:name` (Direct Path)
- **Description**: Get trust score for user
- **Response**: `{ success: boolean, trustScore: number, trustLevel: string, user: object }`

### GET `/access_logs/admin` (Direct Path)
- **Description**: Get all admin access logs
- **Response**: `{ success: boolean, logs: array, count: number }`

### GET `/all_doctor_access_logs` (Direct Path)
- **Description**: Get all doctor access logs
- **Response**: `{ success: boolean, logs: array, count: number }`

### GET `/all_nurse_access_logs` (Direct Path)
- **Description**: Get all nurse access logs
- **Response**: `{ success: boolean, logs: array, count: number }`

### GET `/nurse_access_logs/:name` (Direct Path)
- **Description**: Get nurse access logs by name
- **Response**: `{ success: boolean, logs: array, count: number }`

### GET `/dashboard`
- **Description**: Get dashboard data (recent logs and pending requests)
- **Response**: `{ success: boolean, dashboard: { recentLogs, pendingRequests, timestamp } }`

### GET `/system-info`
- **Description**: Get system information
- **Response**: `{ success: boolean, system: { nodejs, environment, uptime, memory, platform, arch, timestamp } }`

---

## Direct Path Aliases (Root Level)

The following endpoints are available at root level for legacy compatibility:

| Feature | Direct Path | Maps To |
|---------|------------|---------|
| User Login | POST `/user_login` | `/api/auth/user_login` |
| Verify OTP | POST `/verify_otp` | `/api/auth/verify_otp` |
| Resend OTP | POST `/resend_otp` | `/api/auth/resend_otp` |
| IP Check | GET `/ip_check` | `/api/general/ip_check` |
| Trust Score | GET `/trust_score/:name` | `/api/general/trust_score/:name` |
| Get All Users | GET `/get_all_users` | `/api/users/all` |
| Get All Patients | GET `/all_patients` | `/api/patients/` |
| Admin Access Logs | GET `/access_logs/admin` | `/api/general/access_logs/admin` |
| Doctor Access Logs | GET `/all_doctor_access_logs` | `/api/general/all_doctor_access_logs` |
| Nurse Access Logs | GET `/all_nurse_access_logs` | `/api/general/all_nurse_access_logs` |
| Nurse Logs by Name | GET `/nurse_access_logs/:name` | `/api/general/nurse_access_logs/:name` |
| Log Access | POST `/log_access` | `/api/general/log_access` |
| Add Patient | POST `/add_patient` | `/api/patients/` |
| Update Patient | POST `/update_patient` | `/api/patients/:patientId` |
| Delete User | DELETE `/delete_user/:email` | `/api/users/delete_user/:email` |
| Doctor Access | POST `/doctor_access` | `/api/access/doctor_access` |
| Nurse Access | POST `/nurse_access` | `/api/access/nurse_access` |
| Access Precheck | GET `/api/access/precheck` | Direct endpoint |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "✅ Operation completed",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": "❌ Error description"
}
```

---

## Rate Limiting

- **General**: 100 requests per 15 minutes per IP
- **Login**: 5 requests per 1 minute per IP
- **OTP**: 3 requests per 10 minutes per IP
- **Admin**: 50 requests per 15 minutes per IP

---

## Authentication

### Required Headers
- `Authorization: Bearer <firebase-token>` for protected endpoints
- `Content-Type: application/json`

### Firebase Token
Generated by Firebase Authentication. Verify using Firebase Admin SDK.

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
FIREBASE_CONFIG_PATH=./firebase_config.json
ADMIN_EMAIL=admin@ehr.com
TRUST_THRESHOLD=40
TRUSTED_NETWORK=192.168.1.0/24
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ENCRYPTION_KEY=your-256-bit-key-here-must-be-32-chars
```

---

## Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### User Login
```bash
curl -X POST http://localhost:5000/user_login \
  -H "Content-Type: application/json" \
  -d '{"name":"John","role":"doctor","email":"john@example.com"}'
```

### Get All Patients
```bash
curl http://localhost:5000/all_patients
```

---

## Notes

1. All endpoints are fully functional and tested
2. Both `/api/` and direct path access are supported
3. Some endpoints require Firebase authentication
4. Rate limiting is enforced on sensitive operations
5. CORS is configured to allow frontend requests
6. All responses include timestamps for tracking

---

Last Updated: 2026-02-24
Backend Version: 1.0.0
