const multer = require('multer');
const xlsx = require('xlsx');

// error handler
const handleError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.includes('excel') ||
      file.mimetype.includes('spreadsheet')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
}).single('file');

const validateIncrementExcel = (req, res, next) => {
  upload(req, res, (uploadErr) => {
    if (uploadErr) return handleError(res, uploadErr.message);
    if (!req.file) return handleError(res, 'No file uploaded');

    try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

      if (data.length === 0)
        return handleError(res, 'Excel file is empty or unreadable');

      // Basic field presence check only (client does deep validation)
      const requiredColumns = [
        'Employee',
        'Reviewer',
        'Final Score',
        'KRA vs GOALS',
        'Competency',
        'Appraisal Cycle',
      ];

      const firstRow = Object.keys(data[0]);
      const missingColumns = requiredColumns.filter((col) => !firstRow.includes(col));

      if (missingColumns.length > 0) {
        return handleError(
          res,
          `Missing required columns: ${missingColumns.join(', ')}`
        );
      }

      req.excelData = data;
      next();
    } catch (err) {
      console.error(err);
      handleError(res, 'Failed to parse Excel file', 500);
    }
  });
};

module.exports = validateIncrementExcel;
