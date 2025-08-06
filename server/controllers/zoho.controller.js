const axios = require('axios');
const db = require('../config/db');
const sendAuthUrl = async (req, res) => {
    try {
        const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZOHOPEOPLE.forms.ALL&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&prompt=consent&redirect_uri=${process.env.ZOHO_REDIRECT_URI}`;
        res.redirect(authUrl);
    } catch (error) {
        console.log(error);
    }

};

const zohoAuthToken = async(req,res)=>{
    try{
        const { code } = req.query;
        if (!code) {
            return res.status(400).send("Authorization code not found");
        }

        const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
            params: {
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.ZOHO_REDIRECT_URI,
                grant_type: 'authorization_code',
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
console.log(code,'code')
console.log(response.data,'response')


        const { access_token, refresh_token } = response.data;
        
        // Store the tokens securely (database or env variable)
        console.log("Access Token:", access_token);
        console.log("Refresh Token:", refresh_token);

       return res.send("Zoho Authorization Successful! You can now call APIs.");
    
    }catch(error){
        console.log(error);
    }
}

// Function to refresh Zoho access token
// This should be called when the access token expires
const refreshZohoAccessToken = async () => {
    try {
        const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
            params: {
                grant_type: 'refresh_token',
                refresh_token: process.env.ZOHO_REFRESH_TOKEN,
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token } = response.data;
        console.log("✅ New access token generated:", access_token);

        // Save the token (in env or DB)
        process.env.ZOHO_ACCESS_TOKEN = access_token;

        return access_token;
    } catch (error) {
        console.error("❌ Error refreshing access token:", error.response?.data || error.message);
        throw error;
    }
};
// Function to get employee details from Zoho
// This function will handle pagination and return all employee records
const getEmployeeDetailsFromZoho = async (req, res) => {
    let allRecords = [];
    let from = 0;
    const limit = 200;

    try {
        let accessToken = process.env.ZOHO_ACCESS_TOKEN;

        if (!accessToken) {
            return res.status(400).json({ success: false, message: "Missing Zoho access token" });
        }

        const headers = {
            Authorization: `Zoho-oauthtoken ${accessToken}`
        };

        while (true) {
            try {
                const response = await axios.get(
                    `https://people.zoho.com/people/api/forms/employee/getRecords?sIndex=${from + 1}&limit=${limit}`,
                    { headers }
                );

                const records = response.data;
                if (!records || records.length === 0) break;

                if (!records.response.status) {
                    const employees = Object.values(records.response.result)
                        .flatMap(employeeObj => Object.values(employeeObj).flat());

                    allRecords = allRecords.concat(employees);
                    from += limit;
                } else {
                    break;
                }

            } catch (error) {
                if (error.response?.status === 401) {
                    console.log("🔄 Access token expired, refreshing...");
                    await refreshZohoAccessToken();
                    return res.status(401).json({
                        success: false,
                        message: "Access token expired and refreshed. Please click refresh again."
                    });
                }
                console.error("Error fetching employee data:", error.response?.data || error.message);
                break;
            }
        }

        console.log("✅ Total employees fetched:", allRecords.length);

        // 🔹 Upsert employees
        for (const employee of allRecords) {
            const {
                EmployeeID,
                FirstName,
                LastName,
                EmailID,
                Department,
                Designation,
                Dateofjoining,
                Employeestatus,
                Employee_type,
                total_experience,
                Current_Band,
                GROSSMONTHLY_SALARY_FEE_Rs,
            } = employee;

            await db('employee_details')
                .insert({
                    employee_id: EmployeeID,
                    first_name: FirstName,
                    last_name: LastName,
                    email_id: EmailID,
                    department: Department,
                    title: Designation,
                    date_of_joining: Dateofjoining ? new Date(Dateofjoining) : null,
                    employee_status: Employeestatus,
                    employee_type: Employee_type,
                    experience: total_experience ? parseFloat(total_experience) : null,
                    current_band: Current_Band,
                    gross_monthly_salary_or_fee_rs: GROSSMONTHLY_SALARY_FEE_Rs
                        ? parseFloat(GROSSMONTHLY_SALARY_FEE_Rs)
                        : null,
                })
                .onConflict('employee_id')
                .merge({
                    first_name: FirstName,
                    last_name: LastName,
                    email_id: EmailID,
                    department: Department,
                    title: Designation,
                    date_of_joining: Dateofjoining ? new Date(Dateofjoining) : null,
                    employee_status: Employeestatus,
                    employee_type: Employee_type,
                    experience: total_experience ? parseFloat(total_experience) : null,
                    current_band: Current_Band,
                    gross_monthly_salary_or_fee_rs: GROSSMONTHLY_SALARY_FEE_Rs
                        ? parseFloat(GROSSMONTHLY_SALARY_FEE_Rs)
                        : null
                });
        }

        return res.status(200).json({
            success: true,
            message: "Employee details synced successfully",
            total: allRecords.length
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



module.exports ={sendAuthUrl,zohoAuthToken,getEmployeeDetailsFromZoho}