const PDFReportService = require('../services/pdfReportService');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// Generate comprehensive report
const generateComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all data for the report
    const reportData = await gatherReportData(startDate, endDate);
    
    // Generate PDF
    const pdfService = new PDFReportService();
    const doc = pdfService.generateComprehensiveReport(reportData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="comprehensive-report.pdf"');
    
    // Send PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إنشاء التقرير',
      error: error.message 
    });
  }
};

// Generate financial report
const generateFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get financial data
    const reportData = await gatherFinancialData(startDate, endDate);
    
    // Generate PDF
    const pdfService = new PDFReportService();
    const doc = pdfService.generateFinancialReport(reportData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="financial-report.pdf"');
    
    // Send PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إنشاء التقرير المالي',
      error: error.message 
    });
  }
};

// Generate member report
const generateMemberReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get member data
    const reportData = await gatherMemberData(startDate, endDate);
    
    // Generate PDF
    const pdfService = new PDFReportService();
    const doc = pdfService.generateMemberReport(reportData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="member-report.pdf"');
    
    // Send PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('Error generating member report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إنشاء تقرير الأعضاء',
      error: error.message 
    });
  }
};

// Generate vehicle report
const generateVehicleReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get vehicle data
    const reportData = await gatherVehicleData(startDate, endDate);
    
    // Generate PDF
    const pdfService = new PDFReportService();
    const doc = pdfService.generateVehicleReport(reportData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="vehicle-report.pdf"');
    
    // Send PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('Error generating vehicle report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إنشاء تقرير المركبات',
      error: error.message 
    });
  }
};

// Gather all report data
const gatherReportData = async (startDate, endDate) => {
  const memberDateFilter = buildMemberDateFilter(startDate, endDate);
  const paymentDateFilter = buildPaymentDateFilter(startDate, endDate);
  const expenseDateFilter = buildExpenseDateFilter(startDate, endDate);
  
  // Get members data
  const members = await Member.find(memberDateFilter).populate('payments');
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;
  const deceasedMembers = members.filter(m => m.status === 'deceased').length;
  const withdrawnMembers = members.filter(m => m.status === 'withdrawn').length;

  // Get payments data
  const payments = await Payment.find(paymentDateFilter).populate('member');
  const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const incomeByType = {};
  payments.forEach(payment => {
    const type = payment.paymentType;
    incomeByType[type] = (incomeByType[type] || 0) + payment.amount;
  });

  // Get expenses data
  const expenses = await Expense.find(expenseDateFilter);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesByCategory = {};
  expenses.forEach(expense => {
    const category = expense.category;
    expensesByCategory[category] = (expensesByCategory[category] || 0) + expense.amount;
  });

  // Get vehicles data
  const vehicles = await Vehicle.find();
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const inUseVehicles = vehicles.filter(v => v.status === 'in_use').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

  // Get recent activities
  const recentPayments = await Payment.find()
    .populate('member')
    .sort({ paymentDate: -1 })
    .limit(5);

  const recentExpenses = await Expense.find()
    .sort({ date: -1 })
    .limit(5);

  return {
    totalMembers,
    activeMembers,
    inactiveMembers,
    deceasedMembers,
    withdrawnMembers,
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    incomeByType,
    expensesByCategory,
    totalVehicles,
    availableVehicles,
    inUseVehicles,
    maintenanceVehicles,
    recentPayments,
    recentExpenses,
    vehicles: {
      total: totalVehicles,
      available: availableVehicles,
      inUse: inUseVehicles,
      maintenance: maintenanceVehicles
    }
  };
};

// Gather financial data
const gatherFinancialData = async (startDate, endDate) => {
  const paymentDateFilter = buildPaymentDateFilter(startDate, endDate);
  const expenseDateFilter = buildExpenseDateFilter(startDate, endDate);
  
  // Get payments data
  const payments = await Payment.find(paymentDateFilter);
  const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const incomeByType = {};
  payments.forEach(payment => {
    const type = payment.paymentType;
    incomeByType[type] = (incomeByType[type] || 0) + payment.amount;
  });

  // Get expenses data
  const expenses = await Expense.find(expenseDateFilter);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesByCategory = {};
  expenses.forEach(expense => {
    const category = expense.category;
    expensesByCategory[category] = (expensesByCategory[category] || 0) + expense.amount;
  });

  return {
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    incomeByType,
    expensesByCategory
  };
};

// Gather member data
const gatherMemberData = async (startDate, endDate) => {
  const memberDateFilter = buildMemberDateFilter(startDate, endDate);
  
  // Get members data
  const members = await Member.find(memberDateFilter);
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;
  const deceasedMembers = members.filter(m => m.status === 'deceased').length;
  const withdrawnMembers = members.filter(m => m.status === 'withdrawn').length;

  // Get recent payments
  const recentPayments = await Payment.find()
    .populate('member')
    .sort({ paymentDate: -1 })
    .limit(5);

  return {
    totalMembers,
    activeMembers,
    inactiveMembers,
    deceasedMembers,
    withdrawnMembers,
    recentPayments
  };
};

// Gather vehicle data
const gatherVehicleData = async (startDate, endDate) => {
  // Get vehicles data
  const vehicles = await Vehicle.find();
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const inUseVehicles = vehicles.filter(v => v.status === 'in_use').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

  return {
    totalVehicles,
    availableVehicles,
    inUseVehicles,
    maintenanceVehicles,
    vehicles: {
      total: totalVehicles,
      available: availableVehicles,
      inUse: inUseVehicles,
      maintenance: maintenanceVehicles
    }
  };
};

// Build date filter for payments
const buildPaymentDateFilter = (startDate, endDate) => {
  const filter = {};
  
  if (startDate && endDate) {
    filter.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    filter.paymentDate = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.paymentDate = { $lte: new Date(endDate) };
  }
  
  return filter;
};

// Build date filter for expenses
const buildExpenseDateFilter = (startDate, endDate) => {
  const filter = {};
  
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    filter.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.date = { $lte: new Date(endDate) };
  }
  
  return filter;
};

// Build date filter for members
const buildMemberDateFilter = (startDate, endDate) => {
  const filter = {};
  
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    filter.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.createdAt = { $lte: new Date(endDate) };
  }
  
  return filter;
};

module.exports = {
  generateComprehensiveReport,
  generateFinancialReport,
  generateMemberReport,
  generateVehicleReport
}; 