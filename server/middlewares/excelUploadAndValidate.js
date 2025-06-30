const multer = require('multer');
const xlsx = require('xlsx');

//error handler
const handleError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ 
    success: false,
    error: message 
  });
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
}).single('file');

// Main middleware function
const validateIncrementExcel = (req, res, next) => {

  upload(req, res, (uploadErr) => {
    if (uploadErr) return handleError(res, uploadErr.message);
    if (!req.file) return handleError(res, 'No file uploaded');

    try {
   
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) return handleError(res, 'Excel file is empty');
      
      const requiredColumns = ['Employee', 'Reviewer', 'Final Score', 'KRA vs GOALS', 'Competency', 'Appraisal Cycle'];
      const missingColumns = requiredColumns.filter(col => !data[0][col]);
      
      if (missingColumns.length > 0) {
        return handleError(res, `Missing columns: ${missingColumns.join(', ')}`);
      }

      // 5. Quick data validation
      const badRows = [];
      data.forEach((row, index) => {
        const errors = [];
        
        if (!row.Employee || row.Employee.split(' ').length < 3) {
          errors.push('Invalid Employee format');
        }
        
        if (!row.Reviewer || row.Reviewer.split(' ').length < 3) {
          errors.push('Invalid Reviewer format');
        }
        
        if (isNaN(parseFloat(row['Final Score']))) {
          errors.push('Final Score must be a number');
        }

        if (errors.length > 0) {
          badRows.push(`Row ${index + 2}: ${errors.join(', ')}`);
        }
      });

      if (badRows.length > 0) {
        return handleError(res, `Data errors:\n${badRows.join('\n')}`);
      }

      // Attach clean data to request
      req.excelData = data;
      next();

    } catch (err) {
      handleError(res, `Error processing file: ${err.message}`, 500);
    }
  });
};

module.exports = validateIncrementExcel;