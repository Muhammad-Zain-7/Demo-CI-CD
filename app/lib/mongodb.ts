import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://za793984:mythicmuse@mythicmuse.3z1tad7.mongodb.net/?retryWrites=true&w=majority&appName=mythicmuse";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: Cached | undefined;
}

let cachedGlobal: Cached | undefined = global.mongoose;

if (!cachedGlobal) {
  cachedGlobal = { conn: null, promise: null };
  global.mongoose = cachedGlobal;
}

const cached: Cached = cachedGlobal;

// Connection options for better reliability
const connectionOptions = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
};

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = connectionOptions;

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
        cached.promise = null; // Reset promise on failure
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Graceful shutdown handler
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});

// Connection event handlers
mongoose.connection.on("connected", () => {});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {});

export default connectDB;
