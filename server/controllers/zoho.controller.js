const axios = require('axios');
const db = require('../config/db');

/** ---------------------------
 * Zoho Auth Flow
 * --------------------------*/
const sendAuthUrl = async (req, res) => {
  try {
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZOHOPEOPLE.forms.ALL&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&prompt=consent&redirect_uri=${process.env.ZOHO_REDIRECT_URI}`;
    res.redirect(authUrl);
  } catch (error) {
    console.log(error);
  }
};

const zohoAuthToken = async (req, res) => {
  try {
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

    const { access_token, refresh_token } = response.data;

    // Store securely (DB or env)
    process.env.ZOHO_ACCESS_TOKEN = access_token;
    process.env.ZOHO_REFRESH_TOKEN = refresh_token;

    console.log("✅ Access Token:", access_token);
    console.log("✅ Refresh Token:", refresh_token);

    return res.send("Zoho Authorization Successful! You can now call APIs.");
  } catch (error) {
    console.log(error.response?.data || error.message);
    return res.status(500).send("Error getting Zoho access token");
  }
};

/** ---------------------------
 * Token Refresh
 * --------------------------*/
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
    console.log("🔄 New access token generated:", access_token);

    process.env.ZOHO_ACCESS_TOKEN = access_token;
    return access_token;
  } catch (error) {
    console.error("❌ Error refreshing access token:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Helper to parse "Experience" into a number (Zoho may return "2 month(s)")
  const parseExperience = (exp) => {
    if (!exp) return null;
    if (typeof exp === "string") {
      const num = parseFloat(exp);
      return isNaN(num) ? null : num;
    }
    return parseFloat(exp);
  };

// Function to get employee details from Zoho
/** ---------------------------
 * Zoho API Request Wrapper
 * --------------------------*/
const zohoApiRequest = async (method, url, options = {}) => {
  let accessToken = process.env.ZOHO_ACCESS_TOKEN;
  try {
    return await axios({
      method,
      url,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        ...options.headers,
      },
      ...options,
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("⚠️ Access token expired, refreshing...");
      accessToken = await refreshZohoAccessToken();
      return await axios({
        method,
        url,
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          ...options.headers,
        },
        ...options,
      });
    }
    throw error;
  }
};

/** ---------------------------
 * Sync employees + increment_details
 * --------------------------*/
const getEmployeeDetailsFromZoho = async (req, res) => {
  let allRecords = [];
  let from = 0;
  const limit = 200;

  try {
    let accessToken = process.env.ZOHO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: "Missing Zoho access token" });
    }

    const getZohoRecords = async (from, limit, headers) => {
      return axios.get(
        `https://people.zoho.com/people/api/forms/employee/getRecords?sIndex=${from + 1}&limit=${limit}`,
        { headers }
      );
    };

    while (true) {
      try {
        const headers = { Authorization: `Zoho-oauthtoken ${accessToken}` };
        let response;

        try {
          response = await getZohoRecords(from, limit, headers);
        } catch (error) {
          if (error.response?.status === 401) {
            console.log("🔄 Access token expired, refreshing...");
            accessToken = await refreshZohoAccessToken(); // update token
            process.env.ZOHO_ACCESS_TOKEN = accessToken;
            // 🔁 retry with new token
            response = await getZohoRecords(from, limit, {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            });
          } else {
            throw error; // rethrow if not 401
          }
        }

      const records = response.data;
      if (!records) break;

        if (!records.response?.status) {
          const employees = Object.values(records.response.result || {})
            .flatMap((employeeObj) => Object.values(employeeObj || {}).flat());

        if (!employees.length) break;

          allRecords = allRecords.concat(employees);
          from += limit;
        } else {
          break;
        }
      } catch (error) {
        console.error("❌ Error fetching employee data:", error.response?.data || error.message);
        break;
      }
    }

    console.log("✅ Total employees fetched:", allRecords.length);

    const appraisalCycle = getCurrentAppraisalCycle();
    let updatedIncrements = 0;
    let insertedIncrements = 0;

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
        Experience,
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
          experience: parseExperience(Experience),
          current_band: Current_Band,
          gross_monthly_salary_or_fee_rs: GROSSMONTHLY_SALARY_FEE_Rs
            ? parseFloat(GROSSMONTHLY_SALARY_FEE_Rs)
            : null,
        })
        .onConflict("employee_id")
        .merge({
          first_name: FirstName,
          last_name: LastName,
          email_id: EmailID,
          department: Department,
          title: Designation,
          date_of_joining: Dateofjoining ? new Date(Dateofjoining) : null,
          employee_status: Employeestatus,
          employee_type: Employee_type,
          experience: parseExperience(Experience),
          current_band: Current_Band,
          gross_monthly_salary_or_fee_rs: GROSSMONTHLY_SALARY_FEE_Rs
            ? parseFloat(GROSSMONTHLY_SALARY_FEE_Rs)
            : null,
        });

      const tenure = yearsBetween(Dateofjoining);
      const longTenure = typeof tenure === 'number' ? tenure >= 4 : false;

      const incrementPayload = {
        employee_id: EmployeeID,
        appraisal_cycle: appraisalCycle,
        full_name: `${FirstName || ""} ${LastName || ""}`.trim(),
        current_band: Current_Band || null,
        current_salary: GROSSMONTHLY_SALARY_FEE_Rs
          ? parseFloat(GROSSMONTHLY_SALARY_FEE_Rs)
          : null,
        tenure: tenure,
        long_tenure: longTenure,
      };

      const existing = await db("increment_details")
        .select("id")
        .where({ employee_id: EmployeeID, appraisal_cycle: appraisalCycle })
        .first();

      if (existing) {
        await db("increment_details")
          .update({
            full_name: incrementPayload.full_name,
            current_band: incrementPayload.current_band,
            current_salary: incrementPayload.current_salary,
            tenure: incrementPayload.tenure,
            long_tenure: incrementPayload.long_tenure,
          })
          .where({ id: existing.id });

        updatedIncrements += 1;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Employee details & increment details synced successfully",
      totalEmployeesFetched: allRecords.length,
      appraisalCycle,
      incrementDetails: {
        inserted: insertedIncrements,
        updated: updatedIncrements,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// Helper to calculate the current appraisal cycle

/** ---------------------------
 * Helpers
 * --------------------------*/
function getCurrentAppraisalCycle() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (month >= 4) {
    return `April ${year - 1}-Mar ${year}`;
  } else {
    return `April ${year - 1}-Mar ${year}`;
  }
}

function yearsBetween(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;
  const diffMs = Date.now() - start.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Number(years.toFixed(1));
}

module.exports = { sendAuthUrl, zohoAuthToken, getEmployeeDetailsFromZoho };
