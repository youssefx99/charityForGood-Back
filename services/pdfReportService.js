const jsPDF = require('jspdf');
require('jspdf-autotable');

class PDFReportService {
  constructor() {
    this.doc = null;
    this.currentY = 20;
    this.pageWidth = 210;
    this.margin = 20;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  // Initialize new PDF document
  initDocument(title) {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.currentY = 20;
    
    // Add header
    this.addHeader(title);
    this.currentY += 15;
  }

  // Add header with logo and title
  addHeader(title) {
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('جمعية الخير', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 8;
    
    // Subtitle
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(52, 73, 94);
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 8;
    
    // Date
    this.doc.setFontSize(10);
    this.doc.setTextColor(127, 140, 141);
    const currentDate = new Date().toLocaleDateString('ar-SA');
    this.doc.text(`تاريخ التقرير: ${currentDate}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 15;
  }

  // Add section title
  addSectionTitle(title) {
    this.checkPageBreak(15);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(title, this.margin, this.currentY);
    
    // Add line under title
    this.doc.setDrawColor(52, 152, 219);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2);
    
    this.currentY += 10;
  }

  // Add summary cards
  addSummaryCards(data) {
    this.checkPageBreak(40);
    
    const cardWidth = (this.contentWidth - 20) / 2;
    const cardHeight = 25;
    
    // Card 1 - Total Members
    this.addCard(
      this.margin, 
      this.currentY, 
      cardWidth, 
      cardHeight, 
      'إجمالي الأعضاء', 
      data.totalMembers || 0,
      'عضو',
      [52, 152, 219]
    );
    
    // Card 2 - Total Income
    this.addCard(
      this.margin + cardWidth + 10, 
      this.currentY, 
      cardWidth, 
      cardHeight, 
      'إجمالي الإيرادات', 
      data.totalIncome || 0,
      'جنية',
      [46, 204, 113]
    );
    
    this.currentY += cardHeight + 10;
    
    // Card 3 - Total Expenses
    this.addCard(
      this.margin, 
      this.currentY, 
      cardWidth, 
      cardHeight, 
      'إجمالي المصروفات', 
      data.totalExpenses || 0,
      'جنية',
      [231, 76, 60]
    );
    
    // Card 4 - Net Income
    this.addCard(
      this.margin + cardWidth + 10, 
      this.currentY, 
      cardWidth, 
      cardHeight, 
      'صافي الدخل', 
      data.netIncome || 0,
      'جنية',
      [155, 89, 182]
    );
    
    this.currentY += cardHeight + 15;
  }

  // Add individual card
  addCard(x, y, width, height, title, value, unit, color) {
    // Card background
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.rect(x, y, width, height, 'F');
    
    // Title
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(title, x + 5, y + 8);
    
    // Value
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${value.toLocaleString()} ${unit}`, x + 5, y + 18);
  }

  // Add financial summary table
  addFinancialSummary(data) {
    this.checkPageBreak(60);
    
    this.addSectionTitle('الملخص المالي');
    
    const tableData = [
      ['البند', 'المبلغ (جنية)', 'النسبة المئوية'],
      ['إجمالي الإيرادات', data.totalIncome?.toLocaleString() || '0', '100%'],
      ['إجمالي المصروفات', data.totalExpenses?.toLocaleString() || '0', 
       data.totalIncome > 0 ? `${((data.totalExpenses / data.totalIncome) * 100).toFixed(1)}%` : '0%'],
      ['صافي الدخل', data.netIncome?.toLocaleString() || '0', 
       data.totalIncome > 0 ? `${((data.netIncome / data.totalIncome) * 100).toFixed(1)}%` : '0%']
    ];
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add member statistics
  addMemberStatistics(data) {
    this.checkPageBreak(80);
    
    this.addSectionTitle('إحصائيات الأعضاء');
    
    const memberData = [
      ['الحالة', 'العدد', 'النسبة المئوية'],
      ['نشط', data.activeMembers || 0, 
       data.totalMembers > 0 ? `${(((data.activeMembers || 0) / data.totalMembers) * 100).toFixed(1)}%` : '0%'],
      ['غير نشط', data.inactiveMembers || 0, 
       data.totalMembers > 0 ? `${(((data.inactiveMembers || 0) / data.totalMembers) * 100).toFixed(1)}%` : '0%'],
      ['متوفى', data.deceasedMembers || 0, 
       data.totalMembers > 0 ? `${(((data.deceasedMembers || 0) / data.totalMembers) * 100).toFixed(1)}%` : '0%'],
      ['منسحب', data.withdrawnMembers || 0, 
       data.totalMembers > 0 ? `${(((data.withdrawnMembers || 0) / data.totalMembers) * 100).toFixed(1)}%` : '0%']
    ];
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [memberData[0]],
      body: memberData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add income breakdown
  addIncomeBreakdown(data) {
    if (!data.incomeByType || Object.keys(data.incomeByType).length === 0) return;
    
    this.checkPageBreak(60);
    
    this.addSectionTitle('توزيع الإيرادات حسب النوع');
    
    const incomeData = Object.entries(data.incomeByType).map(([type, amount]) => [
      this.getPaymentTypeName(type),
      amount.toLocaleString(),
      data.totalIncome > 0 ? `${((amount / data.totalIncome) * 100).toFixed(1)}%` : '0%'
    ]);
    
    incomeData.unshift(['نوع الإيراد', 'المبلغ (جنية)', 'النسبة المئوية']);
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [incomeData[0]],
      body: incomeData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [46, 204, 113],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add expense breakdown
  addExpenseBreakdown(data) {
    if (!data.expensesByCategory || Object.keys(data.expensesByCategory).length === 0) return;
    
    this.checkPageBreak(60);
    
    this.addSectionTitle('توزيع المصروفات حسب الفئة');
    
    const expenseData = Object.entries(data.expensesByCategory).map(([category, amount]) => [
      this.getExpenseCategoryName(category),
      amount.toLocaleString(),
      data.totalExpenses > 0 ? `${((amount / data.totalExpenses) * 100).toFixed(1)}%` : '0%'
    ]);
    
    expenseData.unshift(['الفئة', 'المبلغ (جنية)', 'النسبة المئوية']);
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [expenseData[0]],
      body: expenseData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [231, 76, 60],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add recent activities
  addRecentActivities(data) {
    this.checkPageBreak(100);
    
    this.addSectionTitle('النشاطات الحديثة');
    
    // Recent Payments
    if (data.recentPayments && data.recentPayments.length > 0) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(44, 62, 80);
      this.doc.text('آخر المدفوعات:', this.margin, this.currentY);
      this.currentY += 8;
      
      const paymentData = data.recentPayments.slice(0, 5).map(payment => [
        payment.member?.fullName ? `${payment.member.fullName.first} ${payment.member.fullName.last}` : 'غير محدد',
        this.getPaymentTypeName(payment.paymentType),
        payment.amount.toLocaleString(),
        new Date(payment.paymentDate).toLocaleDateString('ar-SA')
      ]);
      
      paymentData.unshift(['العضو', 'النوع', 'المبلغ', 'التاريخ']);
      
      this.doc.autoTable({
        startY: this.currentY,
        head: [paymentData[0]],
        body: paymentData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [46, 204, 113],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8
        },
        margin: { left: this.margin, right: this.margin }
      });
      
      this.currentY = this.doc.lastAutoTable.finalY + 10;
    }
    
    // Recent Expenses
    if (data.recentExpenses && data.recentExpenses.length > 0) {
      this.checkPageBreak(60);
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(44, 62, 80);
      this.doc.text('آخر المصروفات:', this.margin, this.currentY);
      this.currentY += 8;
      
      const expenseData = data.recentExpenses.slice(0, 5).map(expense => [
        this.getExpenseCategoryName(expense.category),
        expense.purpose,
        expense.amount.toLocaleString(),
        new Date(expense.date).toLocaleDateString('ar-SA')
      ]);
      
      expenseData.unshift(['الفئة', 'الغرض', 'المبلغ', 'التاريخ']);
      
      this.doc.autoTable({
        startY: this.currentY,
        head: [expenseData[0]],
        body: expenseData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [231, 76, 60],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8
        },
        margin: { left: this.margin, right: this.margin }
      });
      
      this.currentY = this.doc.lastAutoTable.finalY + 10;
    }
  }

  // Add vehicle statistics
  addVehicleStatistics(data) {
    if (!data.vehicles) return;
    
    this.checkPageBreak(80);
    
    this.addSectionTitle('إحصائيات المركبات');
    
    const vehicleData = [
      ['البند', 'العدد'],
      ['إجمالي المركبات', data.totalVehicles || 0],
      ['المركبات المتاحة', data.availableVehicles || 0],
      ['المركبات قيد الاستخدام', data.inUseVehicles || 0],
      ['المركبات في الصيانة', data.maintenanceVehicles || 0]
    ];
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [vehicleData[0]],
      body: vehicleData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [155, 89, 182],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add business insights
  addBusinessInsights(data) {
    this.checkPageBreak(100);
    
    this.addSectionTitle('الرؤى التجارية والتحليلات');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(44, 62, 80);
    
    const insights = [];
    
    // Financial insights
    if (data.totalIncome > 0) {
      const expenseRatio = (data.totalExpenses / data.totalIncome) * 100;
      if (expenseRatio > 80) {
        insights.push('⚠️ نسبة المصروفات مرتفعة - يوصى بمراجعة الميزانية');
      } else if (expenseRatio < 50) {
        insights.push('✅ نسبة المصروفات مناسبة - أداء مالي جيد');
      }
      
      if (data.netIncome < 0) {
        insights.push('🔴 صافي الدخل سالب - يوصى بزيادة الإيرادات أو تقليل المصروفات');
      } else {
        insights.push('🟢 صافي الدخل إيجابي - أداء مالي مستقر');
      }
    }
    
    // Member insights
    if (data.totalMembers > 0) {
      const activeRatio = (data.activeMembers / data.totalMembers) * 100;
      if (activeRatio > 80) {
        insights.push('✅ نسبة الأعضاء النشطين ممتازة');
      } else if (activeRatio < 60) {
        insights.push('⚠️ نسبة الأعضاء النشطين منخفضة - يوصى ببرامج تحفيزية');
      }
    }
    
    // Vehicle insights
    if (data.totalVehicles > 0) {
      const utilizationRatio = (data.inUseVehicles / data.totalVehicles) * 100;
      if (utilizationRatio > 70) {
        insights.push('✅ استغلال المركبات جيد');
      } else {
        insights.push('⚠️ استغلال المركبات منخفض - يوصى بتحسين الجدولة');
      }
    }
    
    // Add insights to PDF
    insights.forEach((insight, index) => {
      this.doc.text(insight, this.margin, this.currentY + (index * 6));
    });
    
    this.currentY += insights.length * 6 + 10;
  }

  // Add footer
  addFooter() {
    this.currentY = 280;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(127, 140, 141);
    this.doc.text('تم إنشاء هذا التقرير بواسطة نظام إدارة جمعية الخير', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 5;
    this.doc.text(`الصفحة ${this.doc.getCurrentPageInfo().pageNumber} من ${this.doc.getNumberOfPages()}`, this.pageWidth / 2, this.currentY, { align: 'center' });
  }

  // Check if we need a page break
  checkPageBreak(requiredSpace) {
    if (this.currentY + requiredSpace > 250) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  // Helper methods for text formatting
  getPaymentTypeName(type) {
    const typeMap = {
      'membership_fee': 'رسوم عضوية',
      'donation': 'تبرع',
      'event_fee': 'رسوم فعالية',
      'other': 'أخرى',
      'رسوم العضوية السنوية': 'رسوم العضوية السنوية',
      'رسوم العضوية الشهرية': 'رسوم العضوية الشهرية',
      'رسوم النشاطات': 'رسوم النشاطات',
      'تبرع عام': 'تبرع عام',
      'تبرع للمشاريع': 'تبرع للمشاريع',
      'تبرع كبير': 'تبرع كبير'
    };
    return typeMap[type] || type;
  }

  getExpenseCategoryName(category) {
    const categoryMap = {
      'utilities': 'مرافق',
      'rent': 'إيجار',
      'salaries': 'رواتب',
      'transportation': 'مواصلات',
      'maintenance': 'صيانة',
      'supplies': 'مستلزمات',
      'events': 'فعاليات',
      'other': 'أخرى',
      'مصاريف إدارية': 'مصاريف إدارية',
      'مصاريف النقل': 'مصاريف النقل',
      'مصاريف الصيانة': 'مصاريف الصيانة',
      'مصاريف النشاطات': 'مصاريف النشاطات',
      'مصاريف الخير': 'مصاريف الخير'
    };
    return categoryMap[category] || category;
  }

  // Generate comprehensive report
  generateComprehensiveReport(data) {
    this.initDocument('تقرير شامل - جمعية الخير');
    
    // Add summary cards
    this.addSummaryCards(data);
    
    // Add financial summary
    this.addFinancialSummary(data);
    
    // Add member statistics
    this.addMemberStatistics(data);
    
    // Add income breakdown
    this.addIncomeBreakdown(data);
    
    // Add expense breakdown
    this.addExpenseBreakdown(data);
    
    // Add vehicle statistics
    this.addVehicleStatistics(data);
    
    // Add recent activities
    this.addRecentActivities(data);
    
    // Add business insights
    this.addBusinessInsights(data);
    
    // Add footer
    this.addFooter();
    
    return this.doc;
  }

  // Generate specific report types
  generateFinancialReport(data) {
    this.initDocument('التقرير المالي');
    
    this.addFinancialSummary(data);
    this.addIncomeBreakdown(data);
    this.addExpenseBreakdown(data);
    this.addBusinessInsights(data);
    this.addFooter();
    
    return this.doc;
  }

  generateMemberReport(data) {
    this.initDocument('تقرير الأعضاء');
    
    this.addMemberStatistics(data);
    this.addRecentActivities(data);
    this.addBusinessInsights(data);
    this.addFooter();
    
    return this.doc;
  }

  generateVehicleReport(data) {
    this.initDocument('تقرير المركبات');
    
    this.addVehicleStatistics(data);
    this.addFooter();
    
    return this.doc;
  }
}

module.exports = PDFReportService; 