const db = require('../config/db'); 
const ExcelJS = require('exceljs');


const downloadExcel = async(req,res,tableName)=>{
    try {
        const rows = await db(`${tableName}`).select('*');

        if (rows.length === 0) {
            return res.status(404).send('No data found');
        }

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add column headers dynamically based on the query result
        worksheet.columns = Object.keys(rows[0]).map((key) => ({
            header: key,
            key: key,
        }));

        // Add rows
        worksheet.addRows(rows);

        // Set response headers for Excel file download
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=data.xlsx'
        );

        // Stream the workbook to the response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).send('Error generating Excel file');
    }
}

module.exports = {downloadExcel};