const mongoose = require("mongoose");

// MongoDB connection string (update with your actual connection string)
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mythicmuse";

async function runSeeder() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    // Import and run the seeder
    const { seedNFTs } = require("./app/lib/seedNFTs.ts");

    console.log("Starting NFT seeding process...");
    const result = await seedNFTs();

    console.log("Seeding completed successfully!");
    console.log("Result:", result);

    process.exit(0);
  } catch (error) {
    console.error("Error running seeder:", error);
    process.exit(1);
  }
}

runSeeder();
