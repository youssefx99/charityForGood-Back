const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Member = require('./models/Member');
const Payment = require('./models/Payment');
const Expense = require('./models/Expense');
const Vehicle = require('./models/Vehicle');
const Trip = require('./models/Trip');
const Maintenance = require('./models/Maintenance');

// Import seed data
const usersData = require('./seeds/users.json');
const membersData = require('./seeds/members.json');
const paymentsData = require('./seeds/payments.json');
const expensesData = require('./seeds/expenses.json');
const vehiclesData = require('./seeds/vehicles.json');
const tripsData = require('./seeds/trips.json');
const maintenanceData = require('./seeds/maintenance.json');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/charity-db"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Hash password function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Seed Users
const seedUsers = async () => {
  try {
    console.log('Seeding Users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Hash passwords and create users
    const hashedUsersData = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password)
      }))
    );
    
    const users = await User.insertMany(hashedUsersData);
    console.log(`✅ ${users.length} users seeded successfully`);
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed Members
const seedMembers = async () => {
  try {
    console.log('Seeding Members...');
    
    // Clear existing members
    await Member.deleteMany({});
    
    const members = await Member.insertMany(membersData);
    console.log(`✅ ${members.length} members seeded successfully`);
    return members;
  } catch (error) {
    console.error('Error seeding members:', error);
    throw error;
  }
};

// Seed Vehicles
const seedVehicles = async () => {
  try {
    console.log('Seeding Vehicles...');
    
    // Clear existing vehicles
    await Vehicle.deleteMany({});
    
    const vehicles = await Vehicle.insertMany(vehiclesData);
    console.log(`✅ ${vehicles.length} vehicles seeded successfully`);
    return vehicles;
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    throw error;
  }
};

// Seed Payments with relationships
const seedPayments = async (users, members) => {
  try {
    console.log('Seeding Payments...');
    
    // Clear existing payments
    await Payment.deleteMany({});
    
    // Create payments with relationships
    const paymentsWithRelations = paymentsData.map((payment, index) => ({
      ...payment,
      member: members[index % members.length]._id, // Distribute payments among members
      collectedBy: users[index % users.length]._id, // Distribute among users
      paymentDate: new Date(payment.paymentDate),
      dueDate: payment.dueDate ? new Date(payment.dueDate) : null
    }));
    
    const payments = await Payment.insertMany(paymentsWithRelations);
    console.log(`✅ ${payments.length} payments seeded successfully`);
    return payments;
  } catch (error) {
    console.error('Error seeding payments:', error);
    throw error;
  }
};

// Seed Expenses with relationships
const seedExpenses = async (users) => {
  try {
    console.log('Seeding Expenses...');
    
    // Clear existing expenses
    await Expense.deleteMany({});
    
    // Create expenses with relationships
    const expensesWithRelations = expensesData.map((expense, index) => ({
      ...expense,
      spentBy: users[index % users.length]._id, // Distribute among users
      approvedBy: users[0]._id, // Admin approves all for now
      date: new Date(expense.date)
    }));
    
    const expenses = await Expense.insertMany(expensesWithRelations);
    console.log(`✅ ${expenses.length} expenses seeded successfully`);
    return expenses;
  } catch (error) {
    console.error('Error seeding expenses:', error);
    throw error;
  }
};

// Seed Trips with relationships
const seedTrips = async (users, members, vehicles) => {
  try {
    console.log('Seeding Trips...');
    
    // Clear existing trips
    await Trip.deleteMany({});
    
    // Create trips with relationships
    const tripsWithRelations = tripsData.map((trip, index) => ({
      ...trip,
      vehicle: vehicles[index % vehicles.length]._id, // Distribute among vehicles
      driver: users[index % users.length]._id, // Distribute among users
      passengers: [members[index % members.length]._id], // One passenger per trip
      startDate: new Date(trip.startDate),
      endDate: trip.endDate ? new Date(trip.endDate) : null
    }));
    
    const trips = await Trip.insertMany(tripsWithRelations);
    console.log(`✅ ${trips.length} trips seeded successfully`);
    return trips;
  } catch (error) {
    console.error('Error seeding trips:', error);
    throw error;
  }
};

// Seed Maintenance with relationships
const seedMaintenance = async (vehicles) => {
  try {
    console.log('Seeding Maintenance...');
    
    // Clear existing maintenance records
    await Maintenance.deleteMany({});
    
    // Create maintenance records with relationships
    const maintenanceWithRelations = maintenanceData.map((maintenance, index) => ({
      ...maintenance,
      vehicle: vehicles[index % vehicles.length]._id, // Distribute among vehicles
      date: new Date(maintenance.date)
    }));
    
    const maintenance = await Maintenance.insertMany(maintenanceWithRelations);
    console.log(`✅ ${maintenance.length} maintenance records seeded successfully`);
    return maintenance;
  } catch (error) {
    console.error('Error seeding maintenance:', error);
    throw error;
  }
};

// Update Member payment records
const updateMemberPaymentRecords = async (members, payments) => {
  try {
    console.log('Updating Member payment records...');
    
    // Group payments by member
    const paymentsByMember = {};
    payments.forEach(payment => {
      const memberId = payment.member.toString();
      if (!paymentsByMember[memberId]) {
        paymentsByMember[memberId] = [];
      }
      paymentsByMember[memberId].push(payment._id);
    });
    
    // Update each member with their payment records
    for (const memberId in paymentsByMember) {
      await Member.findByIdAndUpdate(
        memberId,
        { paymentRecords: paymentsByMember[memberId] }
      );
    }
    
    console.log('✅ Member payment records updated successfully');
  } catch (error) {
    console.error('Error updating member payment records:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Seed in order (respecting relationships)
    const users = await seedUsers();
    const members = await seedMembers();
    const vehicles = await seedVehicles();
    const payments = await seedPayments(users, members);
    const expenses = await seedExpenses(users);
    const trips = await seedTrips(users, members, vehicles);
    const maintenance = await seedMaintenance(vehicles);
    
    // Update relationships
    await updateMemberPaymentRecords(members, payments);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   👤 Members: ${members.length}`);
    console.log(`   🚗 Vehicles: ${vehicles.length}`);
    console.log(`   💰 Payments: ${payments.length}`);
    console.log(`   💸 Expenses: ${expenses.length}`);
    console.log(`   🚐 Trips: ${trips.length}`);
    console.log(`   🔧 Maintenance: ${maintenance.length}`);
    
    console.log('\n🔑 Default login credentials:');
    console.log('   Admin: admin@charity.org / 123456');
    console.log('   Manager: manager@charity.org / 123456');
    console.log('   Staff: staff1@charity.org / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 