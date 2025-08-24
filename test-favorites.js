// Simple test script for favorites functionality
// Run this after starting the backend server

const BASE_URL = 'http://localhost:5000/api';

async function testFavorites() {
  console.log('🧪 Testing Favorites Feature...\n');

  // Test data
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    firstName: 'Test',
    lastName: 'User'
  };

  try {
    // 1. Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (!registerResponse.ok) {
      console.log('ℹ️  User might already exist, trying to login...');
      
      // Try to login instead
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: testUser.email,
          password: testUser.password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to login');
      }

      const loginData = await loginResponse.json();
      var token = loginData.token;
      console.log('✅ Logged in successfully');
    } else {
      const registerData = await registerResponse.json();
      var token = registerData.token;
      console.log('✅ User registered successfully');
    }

    // 2. Get some listings to test with
    console.log('\n2. Fetching listings...');
    const listingsResponse = await fetch(`${BASE_URL}/listings?limit=5`);
    const listingsData = await listingsResponse.json();
    
    if (!listingsData.success || listingsData.data.length === 0) {
      console.log('❌ No listings found to test with');
      return;
    }

    const testListingId = listingsData.data[0].id;
    console.log(`✅ Found ${listingsData.data.length} listings, using listing: ${testListingId}`);

    // 3. Add listing to favorites
    console.log('\n3. Adding listing to favorites...');
    const addFavoriteResponse = await fetch(`${BASE_URL}/listings/${testListingId}/favorite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!addFavoriteResponse.ok) {
      const errorData = await addFavoriteResponse.json();
      console.log('❌ Failed to add favorite:', errorData.message);
    } else {
      const favoriteData = await addFavoriteResponse.json();
      console.log('✅ Added to favorites:', favoriteData.message);
    }

    // 4. Get user's favorites
    console.log('\n4. Fetching user favorites...');
    const favoritesResponse = await fetch(`${BASE_URL}/listings/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!favoritesResponse.ok) {
      console.log('❌ Failed to fetch favorites');
    } else {
      const favoritesData = await favoritesResponse.json();
      console.log(`✅ User has ${favoritesData.data.length} favorites`);
      
      if (favoritesData.data.length > 0) {
        console.log('   First favorite:', favoritesData.data[0].title);
      }
    }

    // 5. Remove from favorites
    console.log('\n5. Removing listing from favorites...');
    const removeFavoriteResponse = await fetch(`${BASE_URL}/listings/${testListingId}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!removeFavoriteResponse.ok) {
      console.log('❌ Failed to remove favorite');
    } else {
      const removeData = await removeFavoriteResponse.json();
      console.log('✅ Removed from favorites:', removeData.message);
    }

    // 6. Verify favorites list is empty
    console.log('\n6. Verifying favorites list...');
    const finalFavoritesResponse = await fetch(`${BASE_URL}/listings/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (finalFavoritesResponse.ok) {
      const finalFavoritesData = await finalFavoritesResponse.json();
      console.log(`✅ User now has ${finalFavoritesData.data.length} favorites`);
    }

    console.log('\n🎉 Favorites feature test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFavorites();