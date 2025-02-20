const axios = require('axios');
const db = require('../config/db');
const sendAuthUrl = async (req, res) => {
    try {
        const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZOHOPEOPLE.forms.ALL&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${process.env.ZOHO_REDIRECT_URI}`;
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
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
console.log(code,'code')
        console.log("response", response)

        const { access_token, refresh_token } = response.data;
        
        // Store the tokens securely (database or env variable)
        console.log("Access Token:", access_token);
        console.log("Refresh Token:", refresh_token);

       return res.send("Zoho Authorization Successful! You can now call APIs.");
    
    }catch(error){
        console.log(error);
    }
}



const getEmployeeDetailsFromZoho = async (req, res) => {
    let allRecords = [];
    let from = 0;
    const limit = 200;

    try {
        const accessToken = '1000.1cb7b3e53ff9c626eb1a84ff986a44ef.40603fe44899f95e2eaf9c4ff4d667c3';
        if (!accessToken) {
            return res.status(400).json({ error: "Missing Zoho access token" });
        }

        const headers = {
            Authorization: `Zoho-oauthtoken ${accessToken}`
        };

        while(true){
            try{
                const response = await axios.get(
                    `https://people.zoho.com/people/api/forms/employee/getRecords?sIndex=${from+1}&limit=${limit}`,
                    {
                        headers
                    }
                );
                const records = response.data;
                if (!records || records.length === 0) break;
    if(!records.response.status){
        
        const employees = Object.values(records.response.result)
        .flatMap(employeeObj => Object.values(employeeObj).flat());

    allRecords = allRecords.concat(employees);        
    from += limit;
    }
    else {
        break;
    }
            }catch(error){
                console.error("Error fetching employee data:", error.response?.data || error.message);
                break;
            }

        }

        // console.log(`Total employees fetched: ${allRecords.length}`);
        for (let i = 0; i < allRecords.length; i++) {
            const employee = allRecords[i];
            const { EmployeeID, FirstName, LastName, EmailID, Department, Designation, Reporting_To, Dateofjoining ,Current_Band,total_experience,Employeestatus,GROSSMONTHLY_SALARY_FEE_Rs,Employee_type} = employee;
            await db('employee_details').insert({
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
                gross_monthly_salary_or_fee_rs: GROSSMONTHLY_SALARY_FEE_Rs ? parseFloat(GROSSMONTHLY_SALARY_FEE_Rs) : null
            });
            
          
        }
console.log("total",allRecords.length)
        return res.status(200).json({ data: allRecords });

    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports ={sendAuthUrl,zohoAuthToken,getEmployeeDetailsFromZoho}