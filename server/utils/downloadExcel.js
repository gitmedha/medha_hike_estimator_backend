const db = require('../config/db'); 
const ExcelJS = require('exceljs');

// Column configuration for specific tables
const tableColumnsMap = {
    bonus_details: [
        { header: 'Review Cycle', key: 'review_cycle' },
        { header: 'Employee ID', key: 'employee_id' },
        { header: 'Full Name', key: 'full_name' },
        { header: 'Manager', key: 'manager' },
        { header: 'KRA', key: 'kra' },
        { header: 'Compentency', key: 'compentency' },
        { header: 'Average', key: 'average' },
        { header: 'Normalized Ratings', key: 'normalized_ratings' },
        { header: 'Bonus', key: 'bonus' },
        { header: 'Weighted Bonus', key: 'weighted_bonus' }
    ],
    increment_details: [
        { header: 'Review Cycle', key: 'appraisal_cycle' },
        { header: 'Employee ID', key: 'employee_id' },
        { header: 'Full Name', key: 'full_name' },
        { header: 'Manager', key: 'manager' },
        { header: 'KRA', key: 'kra_vs_goals' },
        { header: 'Compentency', key: 'compentency' },
        { header: 'Average', key: 'average' },
        { header: 'Normalized Ratings', key: 'normalize_rating' },
        { header: 'Increment', key: 'increment' },
        { header: 'Weighted Increment', key: 'weighted_increment' },
        {header:'Long Tenure', key:'long_tenure'},
        {header:'Current band', key:'current_band'},
        {header:'Current Salary', key:'current_salary'},
        {header:'New Band', key:'new_band'},
        {header:'New Salary', key:'new_salary'},
    ]
};

const downloadExcel = async (req, res, tableName) => {
    try {
        let reviewCycle = req.query.reviewCycle || null;
        let query = db(`${tableName}`).select('*');
        if (reviewCycle) {
            const cycleKey = tableName === 'increment_details' ? 'appraisal_cycle' : 'review_cycle';
            query = query.where(cycleKey, reviewCycle);
        }

        const rows = await query;

        if (rows.length === 0) {
            return res.status(404).send('No data found');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        if (tableColumnsMap[tableName]) {
            // Apply custom column order and mapping
            const customColumns = tableColumnsMap[tableName];
            worksheet.columns = customColumns;

            const filteredRows = rows.map(row => {
                const filtered = {};
                customColumns.forEach(col => {
                    filtered[col.key] = row[col.key];
                });
                return filtered;
            });

            worksheet.addRows(filteredRows);
        } else {
            // Fallback: auto-map columns based on DB result
            worksheet.columns = Object.keys(rows[0]).map((key) => ({
                header: key,
                key: key,
            }));
            worksheet.addRows(rows);
        }

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${tableName}_data.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).send('Error generating Excel file');
    }
};

module.exports = { downloadExcel };
