import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  return mongoose.connection;
};



