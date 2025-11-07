const mongoose = require("mongoose");

const MONGODB_URI =
  "mongodb+srv://za793984:mythicmuse@mythicmuse.3z1tad7.mongodb.net/?retryWrites=true&w=majority&appName=mythicmuse";
const { ObjectId } = mongoose.Types;

// Update this ID if needed
const TARGET_COLLECTION_ID = new ObjectId("68cbcce09f7df4b6cfb17cd5");

// Exactly 40 image URLs, used in order
const imageUrls = [
  "https://i.ibb.co/MD0xBHDD/1758243472926-ae6fmb.png",
  "https://i.ibb.co/JW45sHgT/1758244261129-bgycmx.png",
  "https://i.ibb.co/ZzXH9dmD/1758244323303-ji2z7y.png",
  "https://i.ibb.co/C5pB0cZS/1758244369976-r7i2sb.png",
  "https://i.ibb.co/vvXmcSvD/1758244453119-83m2t8.png",
  "https://i.ibb.co/Q71P5XQs/1758244640190-l8p2ht.png",
  "https://i.ibb.co/bMtGyqGq/1758244689700-vhplgs.png",
  "https://i.ibb.co/ycPw1jd1/1758244733361-pr5u24.png",
  "https://i.ibb.co/PvpCQb0v/1758244777416-41ua9r.png",
  "https://i.ibb.co/Df9xM6kj/1758244994296-ndeycc.png",
  "https://i.ibb.co/zT6DhLDN/1758245088198-cfj07f.png",
  "https://i.ibb.co/V01NZDwg/1758245175145-wfwa20.png",
  "https://i.ibb.co/8g3mH46H/1758245225233-90fec7.png",
  "https://i.ibb.co/fV4JLwzt/1758245286269-ej4sfh.png",
  "https://i.ibb.co/8LqkGDR6/1758245372967-wrfeyr.png",
  "https://i.ibb.co/0jrvMZTZ/1758245451577-251epl.png",
  "https://i.ibb.co/0jd7HM0F/1758245506887-fb3p2k.png",
  "https://i.ibb.co/0Rj5p8zw/1758245567069-d5oyuy.png",
  "https://i.ibb.co/DfBcvtQj/1758245645158-9bps0k.png",
  "https://i.ibb.co/vvXmcSvD/1758244453119-83m2t8.png",
  "https://i.ibb.co/8LRtW7Lw/1758245746592-5q3xzb.png",
  "https://i.ibb.co/gZKjFBfr/1758245822071-5a7tf7.png",
  "https://i.ibb.co/21yn5MmW/1758245863917-kfupc7.png",
  "https://i.ibb.co/39nZF6pp/1758245937888-6ptvt7.png",
  "https://i.ibb.co/YFCwrrbM/1758245994395-cjmj4v.png",
  "https://i.ibb.co/7JSb5t26/1758246067888-ky46w1.png",
  "https://i.ibb.co/Mxb25wYJ/1758246125376-oe7357.png",
  "https://i.ibb.co/qXkkqtT/1758246248908-zym0ko.png",
  "https://i.ibb.co/jPQZ1Xrb/1758246327785-2htwre.png",
  "https://i.ibb.co/KHxgBN3/1758246436104-q29c5c.png",
  "https://i.ibb.co/9ML9MxB/1758246572498-s1lc05.png",
  "https://i.ibb.co/Kp61jfDP/1758246708894-stsi09.png",
  "https://i.ibb.co/7NbTRrKN/1758246783397-hrk8yi.png",
  "https://i.ibb.co/N2FHnL4w/1758246856126-40n9yx.png",
  "https://i.ibb.co/Y6VXTgt/1758246899990-a3vqbo.png",
  "https://i.ibb.co/b5tpQrfS/1758247046225-bw8tsg.png",
  "https://i.ibb.co/YFCwrrbM/1758245994395-cjmj4v.png",
  "https://i.ibb.co/qXkkqtT/1758246248908-zym0ko.png",
];

async function run() {
  await mongoose.connect(MONGODB_URI);

  const collection = mongoose.connection.collection("nfts");

  const nfts = await collection
    .find({ collectionId: TARGET_COLLECTION_ID })
    .sort({ createdAt: 1, _id: 1 })
    .limit(imageUrls.length)
    .toArray();

  const countToUpdate = Math.min(nfts.length, imageUrls.length);

  for (let i = 0; i < countToUpdate; i++) {
    const nft = nfts[i];
    const img = imageUrls[i];
    await collection.updateOne({ _id: nft._id }, { $set: { img } });
  }

  console.log(`Updated ${countToUpdate} NFTs with img URLs.`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
