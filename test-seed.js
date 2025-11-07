const { seedNFTs } = require("./app/lib/seedNFTs.ts");

async function testSeeding() {
  try {
    console.log("Testing NFT seeding...");
    const result = await seedNFTs();
    console.log("Seeding result:", result);
  } catch (error) {
    console.error("Seeding error:", error);
  }
}

testSeeding();
