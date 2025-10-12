// Fallback MongoDB connection for development
// This will be used when MongoDB is not available

export default async function connectDB() {
  console.warn('MongoDB not available, using fallback mode');
  return null;
}

