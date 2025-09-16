import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  const uri = process.env.MONGO_URI || 'mongodb+srv://Eesha:Eesha@cluster0.9sivm.mongodb.net/taskflow?retryWrites=true&w=majority';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  return mongoose.connection;
};



