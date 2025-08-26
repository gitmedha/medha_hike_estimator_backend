// Helper to calculate the current appraisal cycle
function getCurrentAppraisalCycle() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1 = Jan, 12 = Dec

  if (month >= 4) {
    // April–Dec
    return `April ${year-1}-March ${year }`;
  } else {
    // Jan–Mar
    return `April ${year - 1}-March ${year}`;
  }
}

module.exports = { getCurrentAppraisalCycle };
