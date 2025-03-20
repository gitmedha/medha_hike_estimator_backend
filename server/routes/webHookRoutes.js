const express = require('express');
const router = express.Router();
const db = require('../config/db');

// redis.on("connect", () => console.log("Connected to Redis!"));
// redis.on("error", (err) => console.error("Redis error:", err));



router.get('/updateEmployee', async (req, res) => {
    const {
        employee_id, department, experience, employee_status,first_name,last_name,current_band,gross_monthly_salary_or_fee_rs, title,date_of_joining,employee_type
    } = req.query;
    console.log(req.query, "req")

    try {
        const employee = await db("employee_details").where({ employee_id }).first();
        if (employee) {
            await db("employee_details").where({ employee_id }).update({ employee_id, department, experience, employee_status,first_name,last_name,current_band,gross_monthly_salary_or_fee_rs, title,date_of_joining,employee_type
            });

            console.log(`Employee ${employee_id} updated.`);
            return res.status(200).json({ message: "Employee updated in database" });
        } else {
            return res.status(404).json({ error: "Employee not found" });
        }

    } catch (error) {
        return res.status(400).json({ error: "Error updating employee", message: error.message });
    }
});



module.exports = router;