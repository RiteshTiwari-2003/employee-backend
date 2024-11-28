import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('MongoDB Connection Status:', mongoose.connection.readyState);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log('Connected to database:', conn.connection.name);
        
        // Test the connection by listing collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
    } catch (error) {
        console.error('MongoDB Connection Error Details:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.reason) console.error('Error reason:', error.reason);
        process.exit(1);
    }
};

export default connectDB;