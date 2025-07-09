// Test script for validating the Charity Association Management application
// This script will test key API endpoints and database operations

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:8888/api';
let authToken = '';
let testUserId = '';
let testMemberId = '';
let testPaymentId = '';
let testVehicleId = '';

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/charity-app');
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Test Authentication
async function testAuth() {
  console.log('\n🔍 Testing Authentication...');
  
  try {
    // Register a test user
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      username: 'testuser',
      password: 'Test@123',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    });
    
    console.log('✅ User registration successful');
    testUserId = registerResponse.data.user._id;
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'testuser',
      password: 'Test@123'
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ User login successful, token received');
    
    // Get current user
    const userResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Get current user successful:', userResponse.data.data.username);
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test Member Management
async function testMembers() {
  console.log('\n🔍 Testing Member Management...');
  
  try {
    // Create a member
    const createResponse = await axios.post(`${API_URL}/members`, {
      fullName: {
        first: 'محمد',
        middle: 'أحمد',
        last: 'العبدالله'
      },
      dateOfBirth: '1985-05-15',
      nationalId: '1234567890',
      contact: {
        phone: '0501234567',
        email: 'mohammed@example.com'
      },
      primaryAddress: {
        street: 'شارع الملك فهد',
        city: 'الرياض',
        state: 'الرياض',
        postalCode: '12345',
        country: 'المملكة العربية السعودية'
      },
      tribeAffiliation: 'العتيبي',
      membershipStatus: 'active'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    testMemberId = createResponse.data.data._id;
    console.log('✅ Member creation successful');
    
    // Get members
    const getResponse = await axios.get(`${API_URL}/members`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Get members successful, count: ${getResponse.data.pagination.total}`);
    
    // Update member
    await axios.put(`${API_URL}/members/${testMemberId}`, {
      fullName: {
        first: 'محمد',
        middle: 'أحمد',
        last: 'العبدالله'
      },
      contact: {
        phone: '0509876543',
        email: 'mohammed.updated@example.com'
      },
      membershipStatus: 'active'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Member update successful');
    
    return true;
  } catch (error) {
    console.error('❌ Member management test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test Financial Management
async function testFinancial() {
  console.log('\n🔍 Testing Financial Management...');
  
  try {
    // Create a payment
    const paymentResponse = await axios.post(`${API_URL}/payments`, {
      member: testMemberId,
      amount: 500,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'cash',
      paymentType: 'membership_dues',
      isPaid: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    testPaymentId = paymentResponse.data.data._id;
    console.log('✅ Payment creation successful');
    
    // Get payments
    const getPaymentsResponse = await axios.get(`${API_URL}/payments`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Get payments successful, count: ${getPaymentsResponse.data.pagination.total}`);
    
    // Create an expense
    const expenseResponse = await axios.post(`${API_URL}/expenses`, {
      category: 'operational',
      amount: 200,
      date: new Date().toISOString(),
      purpose: 'Office supplies',
      approvalStatus: 'approved',
      spentBy: testUserId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Expense creation successful');
    
    // Get expenses
    const getExpensesResponse = await axios.get(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Get expenses successful, count: ${getExpensesResponse.data.pagination.total}`);
    
    return true;
  } catch (error) {
    console.error('❌ Financial management test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test Vehicle Management
async function testVehicles() {
  console.log('\n🔍 Testing Vehicle Management...');
  
  try {
    // Create a vehicle
    const vehicleResponse = await axios.post(`${API_URL}/vehicles`, {
      make: 'تويوتا',
      model: 'كامري',
      year: 2022,
      licensePlate: 'ABC 1234',
      status: 'available',
      currentOdometer: 5000,
      fuelType: 'gasoline'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    testVehicleId = vehicleResponse.data.data._id;
    console.log('✅ Vehicle creation successful');
    
    // Get vehicles
    const getVehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Get vehicles successful, count: ${getVehiclesResponse.data.pagination.total}`);
    
    // Create a trip
    const tripResponse = await axios.post(`${API_URL}/trips`, {
      vehicle: testVehicleId,
      purpose: 'نقل مساعدات',
      startDate: new Date().toISOString(),
      destination: 'المدينة المنورة',
      driver: 'أحمد محمد',
      status: 'scheduled',
      createdBy: testUserId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Trip creation successful');
    
    // Create maintenance record
    const maintenanceResponse = await axios.post(`${API_URL}/maintenance`, {
      vehicle: testVehicleId,
      maintenanceType: 'regular',
      description: 'تغيير زيت',
      date: new Date().toISOString(),
      cost: 150,
      odometer: 5500,
      serviceProvider: 'مركز الصيانة الرئيسي',
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Maintenance record creation successful');
    
    return true;
  } catch (error) {
    console.error('❌ Vehicle management test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test Reports
async function testReports() {
  console.log('\n🔍 Testing Reports...');
  
  try {
    // Get dashboard report
    const dashboardResponse = await axios.get(`${API_URL}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Dashboard report successful');
    
    // Get members report
    const membersResponse = await axios.get(`${API_URL}/reports/members`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Members report successful');
    
    // Get financial report
    const financialResponse = await axios.get(`${API_URL}/reports/financial`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Financial report successful');
    
    // Get vehicles report
    const vehiclesResponse = await axios.get(`${API_URL}/reports/vehicles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Vehicles report successful');
    
    return true;
  } catch (error) {
    console.error('❌ Reports test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Clean up test data
async function cleanUp() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    if (testMemberId) {
      await axios.delete(`${API_URL}/members/${testMemberId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Test member deleted');
    }
    
    if (testPaymentId) {
      await axios.delete(`${API_URL}/payments/${testPaymentId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Test payment deleted');
    }
    
    if (testVehicleId) {
      await axios.delete(`${API_URL}/vehicles/${testVehicleId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Test vehicle deleted');
    }
    
    if (testUserId) {
      // In a real application, you would have an endpoint to delete users
      console.log('✅ Test user would be deleted (endpoint not implemented for security)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Clean up failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Charity Association Management Application Tests');
  
  // Test database connection
  const dbConnected = await connectDB();
  if (!dbConnected) return;
  
  // Run tests
  const authSuccess = await testAuth();
  if (!authSuccess) return;
  
  const membersSuccess = await testMembers();
  if (!membersSuccess) return;
  
  const financialSuccess = await testFinancial();
  if (!financialSuccess) return;
  
  const vehiclesSuccess = await testVehicles();
  if (!vehiclesSuccess) return;
  
  const reportsSuccess = await testReports();
  if (!reportsSuccess) return;
  
  // Clean up
  await cleanUp();
  
  console.log('\n✅✅✅ All tests completed successfully! ✅✅✅');
  
  // Disconnect from database
  await mongoose.disconnect();
  console.log('📝 MongoDB disconnected');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  mongoose.disconnect();
});
