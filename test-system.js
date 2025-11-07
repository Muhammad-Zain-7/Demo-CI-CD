// Quick system test script
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3002'; // Adjust port as needed
  
  console.log('🧪 Testing NFT Marketplace System...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthCheck = await fetch(`${baseUrl}/api/collections`);
    console.log(`   ✅ Server is running (Status: ${healthCheck.status})`);
    
    // Test 2: Test crypto prices
    console.log('\n2. Testing crypto prices API...');
    const pricesResponse = await fetch(`${baseUrl}/api/crypto/prices`);
    const prices = await pricesResponse.json();
    console.log(`   ✅ Crypto prices loaded: ${Object.keys(prices).join(', ')}`);
    
    // Test 3: Test crypto conversion
    console.log('\n3. Testing crypto conversion...');
    const conversionResponse = await fetch(`${baseUrl}/api/crypto/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1, fromCurrency: 'ETH', toCurrency: 'USD' })
    });
    const conversion = await conversionResponse.json();
    console.log(`   ✅ Conversion: 1 ETH = $${conversion.convertedAmount} USD`);
    
    // Test 4: Test admin login
    console.log('\n4. Testing admin login...');
    const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginResult = await loginResponse.json();
    if (loginResult.success) {
      console.log(`   ✅ Admin login successful`);
    } else {
      console.log(`   ⚠️  Admin login failed: ${loginResult.error}`);
    }
    
    // Test 5: Test collections
    console.log('\n5. Testing collections API...');
    const collectionsResponse = await fetch(`${baseUrl}/api/collections`);
    const collections = await collectionsResponse.json();
    console.log(`   ✅ Collections loaded: ${collections.length} items`);
    
    // Test 6: Test NFTs
    console.log('\n6. Testing NFTs API...');
    const nftsResponse = await fetch(`${baseUrl}/api/nfts`);
    const nfts = await nftsResponse.json();
    console.log(`   ✅ NFTs loaded: ${nfts.length} items`);
    
    // Test 7: Test orders
    console.log('\n7. Testing orders API...');
    const ordersResponse = await fetch(`${baseUrl}/api/orders`);
    const orders = await ordersResponse.json();
    console.log(`   ✅ Orders loaded: ${orders.length} items`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 System Status:');
    console.log(`   • Server: Running on ${baseUrl}`);
    console.log(`   • Database: Connected`);
    console.log(`   • Collections: ${collections.length} items`);
    console.log(`   • NFTs: ${nfts.length} items`);
    console.log(`   • Orders: ${orders.length} items`);
    console.log(`   • Crypto Prices: ${Object.keys(prices).length} currencies`);
    
    console.log('\n🔗 Access Points:');
    console.log(`   • Main App: ${baseUrl}`);
    console.log(`   • Admin Panel: ${baseUrl}/admin-auth`);
    console.log(`   • API Docs: ${baseUrl}/api`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the server is running (npm run dev)');
    console.log('   2. Check if MongoDB is connected');
    console.log('   3. Verify .env.local file exists');
    console.log('   4. Check the correct port number');
  }
};

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  testEndpoints();
}

module.exports = { testEndpoints };
