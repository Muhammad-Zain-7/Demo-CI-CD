import connectDB from "./mongodb";
import NFTCollection from "../models/NFTCollection";
import NFT from "../models/NFT";

const dummyCollections = [
  {
    name: "Ancient Warriors",
    description:
      "Legendary warriors from ancient mythology, each with unique powers and stories. These digital artifacts represent the greatest heroes of antiquity, immortalized in blockchain.",
    imageUrl: "https://picsum.photos/800/600?random=100",
    contractAddress: "0x1234567890123456789012345678901234567890",
    network: "ethereum",
    totalSupply: 15,
    isActive: true,
  },
  {
    name: "Mystical Creatures",
    description:
      "Enchanted beings from folklore and legends, captured in digital form. Each creature holds ancient wisdom and magical powers from forgotten realms.",
    imageUrl: "https://picsum.photos/800/600?random=101",
    contractAddress: "0x2345678901234567890123456789012345678901",
    network: "arbitrum",
    totalSupply: 20,
    isActive: true,
  },
  {
    name: "Divine Entities",
    description:
      "Sacred deities and spiritual manifestations from various cultures. These divine beings represent the highest forms of consciousness and power.",
    imageUrl: "https://picsum.photos/800/600?random=102",
    contractAddress: "0x3456789012345678901234567890123456789012",
    network: "polygon",
    totalSupply: 10,
    isActive: true,
  },
  {
    name: "Cosmic Explorers",
    description:
      "Space-faring adventurers and cosmic entities exploring the infinite reaches of the universe. Each explorer carries the spirit of discovery and wonder.",
    imageUrl: "https://picsum.photos/800/600?random=103",
    contractAddress: "0x4567890123456789012345678901234567890123",
    network: "ethereum",
    totalSupply: 12,
    isActive: true,
  },
  {
    name: "Digital Dreams",
    description:
      "Abstract digital art pieces representing the intersection of technology and creativity. These NFTs explore the boundaries of digital expression.",
    imageUrl: "https://picsum.photos/800/600?random=104",
    contractAddress: "0x5678901234567890123456789012345678901234",
    network: "arbitrum",
    totalSupply: 18,
    isActive: true,
  },
];

// Helper function to generate random USD prices based on crypto currency
const generateRandomUSDPrice = (cryptoPrice: number, currency: string): number => {
  // Base exchange rates (approximate)
  const exchangeRates: Record<string, { min: number; max: number }> = {
    'ETH': { min: 2500, max: 3500 }, // ETH range
    'MATIC': { min: 0.6, max: 1.2 }, // MATIC range
    'USDC': { min: 0.98, max: 1.02 }, // USDC is pegged to USD
    'USDT': { min: 0.98, max: 1.02 }, // USDT is pegged to USD
  };

  const rate = exchangeRates[currency] || exchangeRates['ETH'];
  const randomRate = rate.min + Math.random() * (rate.max - rate.min);
  const usdPrice = cryptoPrice * randomRate;
  
  // Round to 2 decimal places
  return Math.round(usdPrice * 100) / 100;
};

// Helper function to get random images from reliable sources
const getRandomImage = (category: string, width = 400, height = 400) => {
  const categories = {
    warrior: [
      "https://picsum.photos/400/400?random=1", // Ancient warrior
      "https://picsum.photos/400/400?random=2", // Knight
      "https://picsum.photos/400/400?random=3", // Gladiator
      "https://picsum.photos/400/400?random=4", // Samurai
      "https://picsum.photos/400/400?random=5", // Viking
    ],
    creature: [
      "https://picsum.photos/400/400?random=6", // Dragon
      "https://picsum.photos/400/400?random=7", // Phoenix
      "https://picsum.photos/400/400?random=8", // Unicorn
      "https://picsum.photos/400/400?random=9", // Griffin
      "https://picsum.photos/400/400?random=10", // Kraken
    ],
    divine: [
      "https://picsum.photos/400/400?random=11", // Goddess
      "https://picsum.photos/400/400?random=12", // Deity
      "https://picsum.photos/400/400?random=13", // Spirit
      "https://picsum.photos/400/400?random=14", // Angel
      "https://picsum.photos/400/400?random=15", // Divine being
    ],
    cosmic: [
      "https://picsum.photos/400/400?random=16", // Space
      "https://picsum.photos/400/400?random=17", // Galaxy
      "https://picsum.photos/400/400?random=18", // Nebula
      "https://picsum.photos/400/400?random=19", // Stars
      "https://picsum.photos/400/400?random=20", // Planet
    ],
    digital: [
      "https://picsum.photos/400/400?random=21", // Abstract
      "https://picsum.photos/400/400?random=22", // Digital art
      "https://picsum.photos/400/400?random=23", // Cyber
      "https://picsum.photos/400/400?random=24", // Tech
      "https://picsum.photos/400/400?random=25", // Futuristic
    ],
  };

  const categoryImages =
    categories[category as keyof typeof categories] || categories.digital;
  const randomImage =
    categoryImages[Math.floor(Math.random() * categoryImages.length)];
  return randomImage;
};

const dummyNFTs = [
  // Ancient Warriors Collection
  {
    title: "Achilles the Invincible",
    description:
      "The greatest warrior of the Trojan War, blessed with invulnerability except for his heel. This legendary hero represents the pinnacle of martial prowess and divine favor.",
    imageUrl: getRandomImage("warrior"),
    priceCrypto: 0.05,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },
  {
    title: "Spartan King Leonidas",
    description:
      "The legendary king of Sparta who led 300 warriors against the Persian army. A symbol of courage, sacrifice, and unwavering determination in the face of overwhelming odds.",
    imageUrl: getRandomImage("warrior"),
    priceCrypto: 0.08,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },
  {
    title: "Samurai Miyamoto Musashi",
    description:
      "The undefeated swordsman and philosopher from feudal Japan. Master of the blade and the mind, representing the perfect balance of martial arts and wisdom.",
    imageUrl: getRandomImage("warrior"),
    priceCrypto: 0.12,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },
  {
    title: "Viking Ragnar Lothbrok",
    description:
      "The legendary Norse king and warrior, known for his raids and conquests. A fearless leader who sailed the seas in search of glory and adventure.",
    imageUrl: getRandomImage("warrior"),
    priceCrypto: 0.07,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },
  {
    title: "Celtic Warrior Boudicca",
    description:
      "The fierce queen of the Iceni tribe who led a rebellion against Roman rule. A symbol of resistance, strength, and the power of female leadership in ancient times.",
    imageUrl: getRandomImage("warrior"),
    priceCrypto: 0.09,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },
  {
    title: "Alexander the Great",
    description:
      "The Macedonian king who conquered most of the known world before the age of 30. A military genius whose legacy shaped the course of history.",
    imageUrl: getRandomImage("warrior"),
    priceCrypto: 0.15,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },

  // Mystical Creatures Collection
  {
    title: "Phoenix Rising",
    description:
      "The immortal bird that rises from its own ashes, symbolizing rebirth and renewal. A creature of fire and resurrection, representing eternal life and transformation.",
    imageUrl: getRandomImage("creature"),
    priceCrypto: 0.15,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Dragon of the East",
    description:
      "A wise and powerful dragon from Eastern mythology, guardian of ancient wisdom. This celestial being represents strength, wisdom, and the balance of nature.",
    imageUrl: getRandomImage("creature"),
    priceCrypto: 0.25,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Unicorn of the Forest",
    description:
      "A pure and magical creature that brings healing and hope to those who encounter it. Symbol of purity, grace, and the healing power of nature.",
    imageUrl: getRandomImage("creature"),
    priceCrypto: 0.18,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Griffin Guardian",
    description:
      "A majestic creature with the body of a lion and the head of an eagle, protector of treasures. The ultimate guardian, combining the strength of earth and the vision of sky.",
    imageUrl: getRandomImage("creature"),
    priceCrypto: 0.22,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Kraken of the Depths",
    description:
      "The legendary sea monster that dwells in the deepest parts of the ocean. A terrifying yet magnificent creature that rules the abyssal depths.",
    imageUrl: getRandomImage("creature"),
    priceCrypto: 0.2,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Pegasus the Winged Horse",
    description:
      "The divine winged horse born from the blood of Medusa. A symbol of freedom, inspiration, and the power of imagination to transcend earthly limitations.",
    imageUrl: getRandomImage("creature"),
    priceCrypto: 0.28,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },

  // Divine Entities Collection
  {
    title: "Athena Goddess of Wisdom",
    description:
      "The Greek goddess of wisdom, warfare, and crafts, born from Zeus's head. Patron of heroes and cities, representing strategic warfare and divine wisdom.",
    imageUrl: getRandomImage("divine"),
    priceCrypto: 0.3,
    currency: "MATIC",
    network: "polygon",
    isAvailable: true,
  },
  {
    title: "Odin the All-Father",
    description:
      "The Norse god of wisdom, war, and death, ruler of Asgard. The one-eyed god who sacrificed his eye for knowledge and rules the nine realms.",
    imageUrl: getRandomImage("divine"),
    priceCrypto: 0.35,
    currency: "MATIC",
    network: "polygon",
    isAvailable: true,
  },
  {
    title: "Amaterasu Sun Goddess",
    description:
      "The Japanese goddess of the sun and universe, central to Shinto beliefs. The divine ancestor of the Japanese imperial family and source of all light.",
    imageUrl: getRandomImage("divine"),
    priceCrypto: 0.28,
    currency: "MATIC",
    network: "polygon",
    isAvailable: true,
  },
  {
    title: "Anubis Guardian of the Dead",
    description:
      "The Egyptian god of mummification and the afterlife, guide of souls. The jackal-headed deity who weighs hearts against the feather of truth.",
    imageUrl: getRandomImage("divine"),
    priceCrypto: 0.32,
    currency: "MATIC",
    network: "polygon",
    isAvailable: true,
  },
  {
    title: "Quetzalcoatl Feathered Serpent",
    description:
      "The Aztec god of wind and learning, bringer of civilization. The plumed serpent who taught humanity the arts and sciences.",
    imageUrl: getRandomImage("divine"),
    priceCrypto: 0.26,
    currency: "MATIC",
    network: "polygon",
    isAvailable: true,
  },

  // Cosmic Explorers Collection
  {
    title: "Nebula Navigator",
    description:
      "A cosmic explorer who travels through the colorful clouds of stellar nurseries, witnessing the birth of new stars and galaxies.",
    imageUrl: getRandomImage("cosmic"),
    priceCrypto: 0.18,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },
  {
    title: "Galaxy Guardian",
    description:
      "A celestial being who protects entire galaxies from cosmic threats, wielding the power of gravity and stellar energy.",
    imageUrl: getRandomImage("cosmic"),
    priceCrypto: 0.25,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },
  {
    title: "Black Hole Explorer",
    description:
      "An intrepid explorer who ventures into the event horizon of black holes, seeking to unlock the mysteries of spacetime itself.",
    imageUrl: getRandomImage("cosmic"),
    priceCrypto: 0.22,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },
  {
    title: "Solar Wind Surfer",
    description:
      "A cosmic surfer who rides the solar winds between planets, harnessing the power of stellar radiation for interstellar travel.",
    imageUrl: getRandomImage("cosmic"),
    priceCrypto: 0.2,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  },

  // Digital Dreams Collection
  {
    title: "Quantum Consciousness",
    description:
      "An abstract representation of consciousness existing in multiple quantum states simultaneously, exploring the nature of reality itself.",
    imageUrl: getRandomImage("digital"),
    priceCrypto: 0.12,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Neural Network Dreams",
    description:
      "A digital artwork representing the dreams of artificial intelligence, where machine learning algorithms create their own artistic visions.",
    imageUrl: getRandomImage("digital"),
    priceCrypto: 0.15,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Cyberpunk Metropolis",
    description:
      "A futuristic cityscape where neon lights dance with holographic advertisements, representing the intersection of technology and urban life.",
    imageUrl: getRandomImage("digital"),
    priceCrypto: 0.18,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Data Stream Symphony",
    description:
      "A visual representation of data flowing through networks, creating a symphony of information that powers our digital world.",
    imageUrl: getRandomImage("digital"),
    priceCrypto: 0.14,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
  {
    title: "Virtual Reality Garden",
    description:
      "A serene digital garden where virtual plants grow in impossible geometries, representing the beauty that can exist in digital spaces.",
    imageUrl: getRandomImage("digital"),
    priceCrypto: 0.16,
    currency: "ETH",
    network: "arbitrum",
    isAvailable: true,
  },
];

export async function seedNFTs() {
  try {
    await connectDB();

    // Clear existing data
    await NFT.deleteMany({});
    await NFTCollection.deleteMany({});

    

    // Create collections
    const createdCollections = [];
    for (const collectionData of dummyCollections) {
      const collection = new NFTCollection(collectionData);
      await collection.save();
      createdCollections.push(collection);
      
    }

    

    // Define NFT distribution per collection
    const nftDistribution = [
      { collectionIndex: 0, nftCount: 6, category: "warrior" }, // Ancient Warriors
      { collectionIndex: 1, nftCount: 6, category: "creature" }, // Mystical Creatures
      { collectionIndex: 2, nftCount: 5, category: "divine" }, // Divine Entities
      { collectionIndex: 3, nftCount: 4, category: "cosmic" }, // Cosmic Explorers
      { collectionIndex: 4, nftCount: 5, category: "digital" }, // Digital Dreams
    ];

    let totalNFTsCreated = 0;

    // Create NFTs for each collection
    for (const distribution of nftDistribution) {
      const collection = createdCollections[distribution.collectionIndex];
      

      for (let i = 0; i < distribution.nftCount; i++) {
        // Find NFTs that match this collection's category
        const categoryNFTs = dummyNFTs.filter((nft) => {
          if (distribution.category === "warrior") {
            return (
              nft.title.includes("Achilles") ||
              nft.title.includes("Leonidas") ||
              nft.title.includes("Musashi") ||
              nft.title.includes("Ragnar") ||
              nft.title.includes("Boudicca") ||
              nft.title.includes("Alexander")
            );
          } else if (distribution.category === "creature") {
            return (
              nft.title.includes("Phoenix") ||
              nft.title.includes("Dragon") ||
              nft.title.includes("Unicorn") ||
              nft.title.includes("Griffin") ||
              nft.title.includes("Kraken") ||
              nft.title.includes("Pegasus")
            );
          } else if (distribution.category === "divine") {
            return (
              nft.title.includes("Athena") ||
              nft.title.includes("Odin") ||
              nft.title.includes("Amaterasu") ||
              nft.title.includes("Anubis") ||
              nft.title.includes("Quetzalcoatl")
            );
          } else if (distribution.category === "cosmic") {
            return (
              nft.title.includes("Nebula") ||
              nft.title.includes("Galaxy") ||
              nft.title.includes("Black Hole") ||
              nft.title.includes("Solar Wind")
            );
          } else if (distribution.category === "digital") {
            return (
              nft.title.includes("Quantum") ||
              nft.title.includes("Neural") ||
              nft.title.includes("Cyberpunk") ||
              nft.title.includes("Data Stream") ||
              nft.title.includes("Virtual Reality")
            );
          }
          return false;
        });

        if (i < categoryNFTs.length) {
          const nftTemplate = categoryNFTs[i];
          const priceUSD = generateRandomUSDPrice(nftTemplate.priceCrypto, nftTemplate.currency);
          
          const nftData = {
            ...nftTemplate,
            collectionId: collection._id,
            // Update network to match collection
            network: collection.network,
            // Add USD pricing
            priceUSD: priceUSD,
          };

          const nft = new NFT(nftData);
          await nft.save();
          
          totalNFTsCreated++;
        }
      }
    }

    

    return {
      success: true,
      collections: createdCollections.length,
      nfts: totalNFTsCreated,
      message: `Successfully seeded ${createdCollections.length} collections and ${totalNFTsCreated} NFTs with random images and USD pricing`,
    };
  } catch (error) {
    console.error("Error seeding NFTs:", error);
    throw error;
  }
}

export async function updateNFTsWithUSDPricing() {
  try {
    await connectDB();

    

    // Get all NFTs that don't have USD pricing
    const nftsWithoutUSD = await NFT.find({ priceUSD: { $exists: false } });
    
    if (nftsWithoutUSD.length === 0) {
      
      return {
        success: true,
        message: "All NFTs already have USD pricing",
        updated: 0
      };
    }

    let updatedCount = 0;

    for (const nft of nftsWithoutUSD) {
      const priceUSD = generateRandomUSDPrice(nft.priceCrypto, nft.currency);
      
      await NFT.findByIdAndUpdate(nft._id, { priceUSD: priceUSD });
      
      updatedCount++;
    }

    

    return {
      success: true,
      message: `Successfully updated ${updatedCount} NFTs with USD pricing`,
      updated: updatedCount
    };

  } catch (error) {
    console.error("Error updating NFTs with USD pricing:", error);
    throw error;
  }
}
