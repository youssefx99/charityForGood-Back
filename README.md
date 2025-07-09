# Charity Association Management API

A comprehensive backend API for managing charity association operations including members, payments, vehicles, trips, expenses, and maintenance.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Member Management**: Complete CRUD operations for association members
- **Payment Tracking**: Payment collection and installment management
- **Vehicle Management**: Vehicle registration and status tracking
- **Trip Management**: Trip scheduling and tracking
- **Expense Management**: Expense tracking with receipt uploads
- **Maintenance Tracking**: Vehicle maintenance records
- **Reporting**: Comprehensive reporting capabilities
- **File Uploads**: Profile photos, receipts, and document uploads

## Tech Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **Multer**: File uploads
- **CORS**: Cross-origin resource sharing

## Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- npm or yarn

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/charity-db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   PORT=5000
   ```

4. **Start the server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword` - Reset password

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `POST /api/members/:id/photo` - Upload profile photo

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get single payment
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get single trip
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `GET /api/maintenance/:id` - Get single maintenance record
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Reports
- `GET /api/reports/members` - Member reports
- `GET /api/reports/payments` - Payment reports
- `GET /api/reports/expenses` - Expense reports

## Vercel Deployment

This project is configured for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deployment Steps:

1. **Push to Git**: Ensure your code is in a Git repository
2. **Connect to Vercel**: Import your repository in Vercel dashboard
3. **Set Environment Variables**:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secure random string
   - `JWT_EXPIRE`: Token expiration (e.g., "30d")
   - `NODE_ENV`: "production"
4. **Deploy**: Click deploy in Vercel dashboard

## File Uploads

### Development
Files are stored locally in the `uploads/` directory.

### Production
For production deployment, implement cloud storage:

#### AWS S3
```bash
npm install aws-sdk
```

#### Google Cloud Storage
```bash
npm install @google-cloud/storage
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for implementation details.

## Database Schema

### User
- `username`: String (unique)
- `password`: String (hashed)
- `fullName`: String
- `email`: String (unique)
- `role`: String (default: 'member')
- `isActive`: Boolean
- `lastLogin`: Date

### Member
- `fullName`: Object (first, middle, last)
- `dateOfBirth`: Date
- `nationalId`: String (unique)
- `contact`: Object (phone, email)
- `primaryAddress`: Object
- `alternateAddress`: Object
- `tribeAffiliation`: String
- `membershipStatus`: String
- `profilePhoto`: String
- `emergencyContact`: Object
- `joinDate`: Date
- `notes`: String
- `paymentRecords`: Array of Payment references

### Payment
- `member`: ObjectId (ref: Member)
- `amount`: Number
- `paymentDate`: Date
- `paymentMethod`: String
- `paymentType`: String
- `dueDate`: Date
- `isPaid`: Boolean
- `isInstallment`: Boolean
- `installmentPlan`: Object
- `receiptNumber`: String (unique)
- `collectedBy`: ObjectId (ref: User)
- `notes`: String

### Vehicle
- `make`: String
- `model`: String
- `year`: Number
- `licensePlate`: String (unique)
- `status`: String
- `currentOdometer`: Number
- `fuelType`: String
- `registrationExpiry`: Date
- `insuranceExpiry`: Date
- `documents`: Array of Strings
- `notes`: String

### Trip
- `vehicle`: ObjectId (ref: Vehicle)
- `driver`: ObjectId (ref: User)
- `startDate`: Date
- `endDate`: Date
- `purpose`: String
- `startOdometer`: Number
- `endOdometer`: Number
- `status`: String
- `passengers`: Array of ObjectIds (ref: Member)
- `notes`: String

### Expense
- `category`: String
- `amount`: Number
- `date`: Date
- `purpose`: String
- `receipt`: String
- `approvalStatus`: String
- `approvedBy`: ObjectId (ref: User)
- `spentBy`: ObjectId (ref: User)
- `notes`: String

### Maintenance
- `vehicle`: ObjectId (ref: Vehicle)
- `maintenanceType`: String
- `date`: Date
- `odometer`: Number
- `description`: String
- `cost`: Number
- `serviceProvider`: String
- `documents`: Array of Strings
- `notes`: String

## Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Mongoose schema validation
- **File Upload Security**: File type and size restrictions

## Error Handling

- **Global Error Handler**: Catches and formats all errors
- **Validation Errors**: Proper error messages for invalid data
- **Authentication Errors**: Clear unauthorized access messages
- **File Upload Errors**: Specific error messages for upload issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository. 