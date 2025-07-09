const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenance = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filter options
    let query = {};

    if (req.query.vehicle) {
      query.vehicle = req.query.vehicle;
    }

    if (req.query.maintenanceType) {
      query.maintenanceType = req.query.maintenanceType;
    }

    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Execute query
    const maintenanceRecords = await Maintenance.find(query)
      .populate("vehicle", "make model licensePlate")
      .skip(startIndex)
      .limit(limit)
      .sort({ date: -1 });

    // Get total count
    const total = await Maintenance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: maintenanceRecords.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: maintenanceRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في استرجاع سجلات الصيانة",
      error: error.message,
    });
  }
};

// @desc    Get single maintenance record
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenanceRecord = async (req, res) => {
  try {
    const maintenanceRecord = await Maintenance.findById(
      req.params.id
    ).populate("vehicle", "make model licensePlate");

    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: "سجل الصيانة غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: maintenanceRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في استرجاع سجل الصيانة",
      error: error.message,
    });
  }
};

// @desc    Create new maintenance record
// @route   POST /api/maintenance
// @access  Private
exports.createMaintenance = async (req, res) => {
  try {
    console.log("Request body:", req.body); // ✅ Add this to see what data is being sent

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(req.body.vehicle);
    console.log("Vehicle found:", vehicle);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "المركبة غير موجودة",
      });
    }

    // Validate required fields before creating
    const { maintenanceType, date, description, cost, serviceProvider } =
      req.body;

    if (
      !maintenanceType ||
      !date ||
      !description ||
      !cost ||
      !serviceProvider
    ) {
      return res.status(400).json({
        success: false,
        message: "جميع الحقول المطلوبة مفقودة",
        missing: {
          maintenanceType: !maintenanceType,
          date: !date,
          description: !description,
          cost: !cost,
          serviceProvider: !serviceProvider,
        },
      });
    }

    // If maintenance type is not 'inspection', update vehicle status
    if (req.body.maintenanceType !== "inspection") {
      vehicle.status = "maintenance";
      await vehicle.save();
    }

    // Create maintenance record
    const maintenanceRecord = await Maintenance.create(req.body);
    console.log("Created maintenance record:", maintenanceRecord);

    res.status(201).json({
      success: true,
      data: maintenanceRecord,
    });
  } catch (error) {
    console.error("Detailed error:", error); // ✅ Add detailed error logging
    res.status(500).json({
      success: false,
      message: "خطأ في إنشاء سجل الصيانة",
      error: error.message,
    });
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private
exports.updateMaintenance = async (req, res) => {
  try {
    let maintenanceRecord = await Maintenance.findById(req.params.id);

    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: "سجل الصيانة غير موجود",
      });
    }

    // Update maintenance record
    maintenanceRecord = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: maintenanceRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في تحديث سجل الصيانة",
      error: error.message,
    });
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Private
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenanceRecord = await Maintenance.findById(req.params.id);

    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: "سجل الصيانة غير موجود",
      });
    }

    await maintenanceRecord.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في حذف سجل الصيانة",
      error: error.message,
    });
  }
};

// @desc    Update maintenance status
// @route   PUT /api/maintenance/:id/status
// @access  Private
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const maintenanceRecord = await Maintenance.findById(req.params.id);

    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: "سجل الصيانة غير موجود",
      });
    }

    // Update vehicle status back to available
    const vehicle = await Vehicle.findById(maintenanceRecord.vehicle);
    if (vehicle && vehicle.status === "maintenance") {
      vehicle.status = "available";
      await vehicle.save();
    }

    res.status(200).json({
      success: true,
      data: maintenanceRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ في إكمال الصيانة",
      error: error.message,
    });
  }
};


