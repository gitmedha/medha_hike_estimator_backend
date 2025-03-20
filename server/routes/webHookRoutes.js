const express = require('express');
const router = express.Router();
const db = require('../config/db');

// redis.on("connect", () => console.log("Connected to Redis!"));
// redis.on("error", (err) => console.error("Redis error:", err));



router.get('/updateEmployee', async (req, res) => {
    const {
        employee_id, department, experience, employee_status,first_name,last_name,current_band,gross_monthly_salary_or_fee_rs, title,date_of_joining,employee_type
    } = req.query;

    try {
        const employee = await db("employee_details").where({ employee_id }).first();
        if (employee) {
            await db("employee_details").where({ employee_id }).update({ employee_id, department, experience, employee_status,first_name,last_name,current_band,gross_monthly_salary_or_fee_rs, title,date_of_joining,employee_type
            });

            return res.status(200).json({ message: "Employee updated in database" });
        } else {
            await db("employee_details").insert({ employee_id, department, experience, employee_status, first_name, last_name, current_band, gross_monthly_salary_or_fee_rs, title, date_of_joining, employee_type });
            return res.status(200).json({ message: "Employee created in database" });
        }

    } catch (error) {
        return res.status(400).json({ error: "Error updating employee", message: error.message });
    }
});

router.post('/createEmployee', async (req, res) => {
    const {
        employee_id, department, experience, employee_status, first_name, last_name, current_band, gross_monthly_salary_or_fee_rs, title, date_of_joining, employee_type
    } = req.body;
    try {
        const employee = await db("employee_details").where({ employee_id }).first();
        if (employee) {
            return res.status(409).json({ error: "Employee already exists" });
        }
        await db("employee_details").insert({ employee_id, department, experience, employee_status, first_name, last_name, current_band, gross_monthly_salary_or_fee_rs, title, date_of_joining, employee_type });
        
    } catch (error) {
        res.status(400).json({ error: "Error creating employee", message: error.message });
    }
})



module.exports = router;