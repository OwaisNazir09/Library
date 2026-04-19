const getAttendanceModel = async (db) => {
  try {
    return db.model('Attendance');
  } catch (e) {
    const { default: attendanceSchema } = await import('./attendance.model.js');
    return db.model('Attendance', attendanceSchema);
  }
};

export const scanQR = async (req, res, next) => {
  try {
    const AttendanceModel = await getAttendanceModel(req.db);

    const { libraryId, timestamp, note } = req.body;
    const targetLibraryId = libraryId || req.tenantId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activeAttendance = await AttendanceModel.findOne({
      userId: req.user._id,
      tenantId: req.tenantId,
      checkIn: { $gte: today },
      checkOut: { $exists: false }
    });

    if (activeAttendance) {
      activeAttendance.checkOut = new Date();
      await activeAttendance.save();

      const populated = await activeAttendance.populate('userId', 'fullName email');
      return res.status(200).json({
        status: 'success',
        message: 'Checked out successfully',
        data: { attendance: populated }
      });
    } else {
      // Check In
      const record = await AttendanceModel.create({
        tenantId: req.tenantId,
        userId: req.user._id,
        libraryId: targetLibraryId,
        checkIn: timestamp ? new Date(timestamp) : new Date(),
        method: 'qr',
        note
      });

      const populated = await record.populate('userId', 'fullName email');
      res.status(201).json({
        status: 'success',
        message: 'Checked in successfully',
        data: { attendance: populated }
      });
    }
  } catch (err) {
    next(err);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const AttendanceModel = await getAttendanceModel(req.db);
    const { userId, note, checkIn } = req.body;

    if (!userId) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    const record = await AttendanceModel.create({
      tenantId: req.tenantId,
      userId,
      libraryId: req.tenantId,
      checkIn: checkIn ? new Date(checkIn) : new Date(),
      method: 'manual',
      note
    });

    const populated = await record.populate('userId', 'fullName email');

    res.status(201).json({
      status: 'success',
      message: 'Attendance marked successfully',
      data: { attendance: populated }
    });
  } catch (err) {
    next(err);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const AttendanceModel = await getAttendanceModel(req.db);

    const records = await AttendanceModel
      .find({ userId: req.user._id, tenantId: req.tenantId })
      .sort({ checkIn: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      results: records.length,
      data: { attendance: records }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    const AttendanceModel = await getAttendanceModel(req.db);

    const filter = { tenantId: req.tenantId };
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);
      filter.checkIn = { $gte: start, $lte: end };
    }

    const records = await AttendanceModel
      .find(filter)
      .sort({ checkIn: -1 })
      .populate('userId', 'fullName email')
      .limit(200);

    res.status(200).json({
      status: 'success',
      results: records.length,
      data: { attendance: records }
    });
  } catch (err) {
    next(err);
  }
};
