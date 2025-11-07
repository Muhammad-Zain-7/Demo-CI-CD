const mongoose = require("mongoose");

const MONGODB_URI =
  "mongodb+srv://za793984:mythicmuse@mythicmuse.3z1tad7.mongodb.net/?retryWrites=true&w=majority&appName=mythicmuse";
const { ObjectId } = mongoose.Types;

// Collection image URLs to update
const collectionImages = [
  "https://i.postimg.cc/k5nFDrjV/image.png",
  "https://i.postimg.cc/xdYgHN1Z/image.png",
  "https://i.postimg.cc/L8gGvPRh/345.jpg",
];

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    const collection = mongoose.connection.collection("nftcollections");

    // Get all collections
    const collections = await collection
      .find({ isActive: true })
      .sort({ createdAt: 1, _id: 1 })
      .toArray();

    console.log(`Found ${collections.length} collections to update`);

    const countToUpdate = Math.min(collections.length, collectionImages.length);

    for (let i = 0; i < countToUpdate; i++) {
      const collectionDoc = collections[i];
      const imgUrl = collectionImages[i];

      await collection.updateOne(
        { _id: collectionDoc._id },
        { $set: { img: imgUrl } }
      );

      console.log(
        `Updated collection "${collectionDoc.name}" with image: ${imgUrl}`
      );
    }

    console.log(
      `Successfully updated ${countToUpdate} collections with img URLs.`
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error updating collections:", error);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

run();
