import mongoose from "mongoose";
import dns from "dns";

let cached: typeof mongoose | null = null;

const DNS_SERVERS = (process.env.DNS_SERVERS ?? "8.8.8.8,1.1.1.1")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (DNS_SERVERS.length > 0) {
  try {
    dns.setServers(DNS_SERVERS);
  } catch (err) {
    console.warn("[db] Could not override DNS servers:", err);
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy backend/.env.example to .env and fill it in.");
  }
  try {
    cached = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("[db] Connected to MongoDB");
    return cached;
  } catch (err) {
    console.error("[db] Failed to connect to MongoDB:", err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  if (cached) {
    await cached.disconnect();
    cached = null;
  }
}
