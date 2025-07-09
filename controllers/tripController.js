const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
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
    
    if (req.query.driver) {
      query.driver = req.query.driver;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.startDate && req.query.endDate) {
      query.startDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Execute query
    const trips = await Trip.find(query)
      .populate('vehicle', 'make model licensePlate')
      .populate('driver', 'fullName')
      .populate('passengers', 'fullName.first fullName.last')
      .skip(startIndex)
      .limit(limit)
      .sort({ startDate: -1 });
    
    // Get total count
    const total = await Trip.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: trips.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع بيانات الرحلات',
      error: error.message
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle', 'make model licensePlate')
      .populate('driver', 'fullName')
      .populate('passengers', 'fullName.first fullName.last');
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'الرحلة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع بيانات الرحلة',
      error: error.message
    });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
  try {
    // Check if vehicle is available
    const vehicle = await Vehicle.findById(req.body.vehicle);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'المركبة غير موجودة'
      });
    }
    
    if (vehicle.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'المركبة غير متاحة حاليًا'
      });
    }
    
    // Create trip
    const trip = await Trip.create(req.body);
    
    // Update vehicle status
    vehicle.status = 'in_use';
    await vehicle.save();
    
    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الرحلة',
      error: error.message
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'الرحلة غير موجودة'
      });
    }
    
    // If vehicle is being changed, check availability
    if (req.body.vehicle && req.body.vehicle !== trip.vehicle.toString()) {
      const vehicle = await Vehicle.findById(req.body.vehicle);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'المركبة غير موجودة'
        });
      }
      
      if (vehicle.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'المركبة غير متاحة حاليًا'
        });
      }
      
      // Free up previous vehicle
      const previousVehicle = await Vehicle.findById(trip.vehicle);
      if (previousVehicle) {
        previousVehicle.status = 'available';
        await previousVehicle.save();
      }
      
      // Update new vehicle status
      vehicle.status = 'in_use';
      await vehicle.save();
    }
    
    // Update trip
    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات الرحلة',
      error: error.message
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'الرحلة غير موجودة'
      });
    }
    
    // Free up vehicle if trip is not completed
    if (trip.status !== 'completed' && trip.status !== 'cancelled') {
      const vehicle = await Vehicle.findById(trip.vehicle);
      if (vehicle) {
        vehicle.status = 'available';
        await vehicle.save();
      }
    }
    
    await trip.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الرحلة',
      error: error.message
    });
  }
};

// @desc    Complete trip
// @route   PUT /api/trips/:id/complete
// @access  Private
exports.completeTrip = async (req, res) => {
  try {
    const { endOdometer } = req.body;
    
    if (!endOdometer) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم قراءة عداد المسافات النهائية'
      });
    }
    
    let trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'الرحلة غير موجودة'
      });
    }
    
    if (trip.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'تم الانتهاء من الرحلة بالفعل'
      });
    }
    
    if (trip.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'تم إلغاء الرحلة ولا يمكن إكمالها'
      });
    }
    
    // Update trip
    trip.status = 'completed';
    trip.endDate = Date.now();
    trip.endOdometer = endOdometer;
    await trip.save();
    
    // Update vehicle status and odometer
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle) {
      vehicle.status = 'available';
      vehicle.currentOdometer = endOdometer;
      await vehicle.save();
    }
    
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إكمال الرحلة',
      error: error.message
    });
  }
};

// @desc    Cancel trip
// @route   PUT /api/trips/:id/cancel
// @access  Private
exports.cancelTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'الرحلة غير موجودة'
      });
    }
    
    if (trip.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'تم الانتهاء من الرحلة بالفعل ولا يمكن إلغاؤها'
      });
    }
    
    if (trip.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'تم إلغاء الرحلة بالفعل'
      });
    }
    
    // Update trip
    trip.status = 'cancelled';
    await trip.save();
    
    // Free up vehicle
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle) {
      vehicle.status = 'available';
      await vehicle.save();
    }
    
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إلغاء الرحلة',
      error: error.message
    });
  }
};
