# Vercel Deployment Guide

## Prerequisites

1. **MongoDB Database**: Set up a MongoDB database (MongoDB Atlas recommended for production)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket

## Environment Variables

Set these environment variables in your Vercel dashboard:

### Required Variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `JWT_EXPIRE`: JWT token expiration (e.g., "30d")
- `NODE_ENV`: Set to "production"

### Optional Variables (for file uploads):
- `AWS_S3_BUCKET`: S3 bucket name for file storage
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region

## Deployment Steps

1. **Connect Repository**:
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**:
   - Framework Preset: Node.js
   - Root Directory: `./` (or your backend folder)
   - Build Command: `npm run build`
   - Output Directory: `./`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Go to Project Settings > Environment Variables
   - Add all required variables listed above

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

## File Upload Configuration

For production file uploads, you'll need to implement cloud storage:

### Option 1: AWS S3
```javascript
// In utils/fileUpload.js, implement S3 upload
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const uploadToS3 = async (file, type) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${type}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
};
```

### Option 2: Google Cloud Storage
```javascript
// Install: npm install @google-cloud/storage
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);

const uploadToGCS = async (file, type) => {
  const blob = bucket.file(`${type}/${Date.now()}-${file.originalname}`);
  await blob.save(file.buffer, {
    contentType: file.mimetype,
    public: true
  });
  return `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET}/${blob.name}`;
};
```

## CORS Configuration

Update the CORS origins in `app.js` with your frontend URLs:

```javascript
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:8888",
    "https://your-frontend-domain.vercel.app",
    "https://your-frontend-domain.netlify.app"
  ],
  credentials: true
}));
```

## API Endpoints

Your API will be available at:
- Development: `http://localhost:5000`
- Production: `https://your-app-name.vercel.app`

## Troubleshooting

1. **Database Connection Issues**:
   - Ensure MongoDB URI is correct
   - Check if MongoDB Atlas IP whitelist includes Vercel's IPs

2. **File Upload Issues**:
   - Implement cloud storage for production
   - Check file size limits

3. **CORS Issues**:
   - Update CORS origins with your frontend URL
   - Ensure credentials are properly configured

4. **Environment Variables**:
   - Double-check all variables are set in Vercel dashboard
   - Redeploy after changing environment variables

## Monitoring

- Use Vercel's built-in analytics and monitoring
- Set up error tracking (Sentry, etc.)
- Monitor API response times and errors 