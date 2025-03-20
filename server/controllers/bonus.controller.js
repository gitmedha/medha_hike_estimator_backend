const {
    fetchAllBonusService,
    searchDropDownService,
    searchBonusService,
    createBonusService,
    getBonusByIdService,
    getPickLists,
    updateBonusService,
    deleteBonusService,
    uploadBonusData,
    calculateBonusRating,
    calculateBonusPercentage,
    BulkBonusRating,
    BulkBonus,
    getWeightedBonus,
    calculateBulkWeightedBonus
} = require("../services/bonus.services");

const db = require("../config/db");

const {updateNormalizedRating} = require("../models/bonus.model");
const { downloadExcel} = require('../utils/downloadExcel');


const fetchAllBonus = async(req,res)=>{
    try {
        const {offset,limit,sortBy,sortOrder} = req.params;
        
        const result = await fetchAllBonusService(Number(offset),Number(limit),sortBy,sortOrder);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
}

const fetchBonusById = async(req,res)=>{
    const {id,review_cycle} = req.params;
    try {
        const result = await getBonusByIdService(id,review_cycle);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
 
}

const createBonus = async(req,res)=>{
    try {
        const result = await createBonusService(req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
 
}

const updateBonus = async(req,res)=>{
    const {id} = req.params;
    try {
        const result = await updateBonusService(id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
 
}

const deleteBonus = async(req,res)=>{
    const {id} = req.params;
    try {
        const result = await deleteBonusService(id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
}

const searchDropDown = async(req,res)=>{
    const {field} = req.params;
    try {
        const result = await searchDropDownService(field);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }

}

const searchBonus = async(req,res)=>{
    const {field, value,offset,limit} = req.body;
    try {
        const result = await searchBonusService(field, value,offset,limit);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
 
}

const loadDropDown = async(req,res)=>{
    try {
        const result = await getPickLists();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

}

const normalizedRating = async(req,res)=>{
    try {
        const normalizedRating = await calculateBonusRating(req.body);
        await updateNormalizedRating(req.body.employeeId, req.body.reviewCycle,normalizedRating);
        return res.status(200).json(normalizedRating);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message});
    }

}

const calculateBonus = async(req,res)=>{
    try {
        const { normalizedRating ,employeeId,reviewCycle} = req.body;
        const result = await calculateBonusPercentage(normalizedRating,employeeId,reviewCycle);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Bonus not found' });
          }
          return res.status(200).json({ message:"Bonus calculated successfully", data: `${result}%` });        
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const uploadBonusFile = async(req,res)=>{
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded!' });
        }

        const result = await uploadBonusData(req);
        return res.status(200).json(result);
        
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const bulkRating = async(req,res)=>{
    try {
        const {reviewCycle} = req.query;
        const result = await BulkBonusRating(reviewCycle);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const calculateBulkBonus = async(req,res) => {
    try {
        const {reviewCycle} = req.query;
        const result = await BulkBonus(reviewCycle);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const downloadPgToXl = async (req,res)=>{
    try {
      await downloadExcel(req,res,'bonus_details');
    } catch (error) {
      res.status(500).json({error: 'Error downloading excel file', details: error.message});
    }
  }

const weightedBonus = async(req,res)=>{
    try {
        const { employeeId } = req.body;
        const { reviewCycle} = req.query;
        const result = await getWeightedBonus(employeeId,reviewCycle);
        if (isNaN(parseFloat(result))) {
            return res.status(404).json({ message: 'Weighted bonus not found' });
        }
        await db('bonus_details').where({employee_id: employeeId, review_cycle: reviewCycle}).update({weighted_bonus: parseFloat(result)});
       
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const bulkWeightedBonus= async (req,res)=>{
    try {
        const {reviewCycle} = req.body;
        const result = await calculateBulkWeightedBonus(reviewCycle);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const getAllReviewCycles = async(req,res)=>{
    const {id} = req.params;
    try {
        const result = await db('bonus_details').select('review_cycle').where('employee_id',id);
        const picklistArray = result.map(cycle=>({label:cycle.review_cycle, value:cycle.review_cycle}));
        return res.status(200).json(picklistArray);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const getAllCycles = async(req,res)=>{
    try {
        const result = await db('bonus_details').select('review_cycle').distinct();
        const picklistArray = result.map(cycle=>({label:cycle.review_cycle, value:cycle.review_cycle}));
        return res.status(200).json(picklistArray);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const getAllBonusesByReview = async(req,res)=>{
    const {pageSize,pageIndex,sortBy,sortOrder,reviewCycle} = req.query;
    try {
        const result = await db('bonus_details').where({review_cycle:reviewCycle}).orderBy(sortBy,sortOrder).limit(pageSize).offset(pageIndex * pageSize);
        const totalCount = await db('bonus_details').where({review_cycle:reviewCycle}).count();
        return res.status(200).json({
            data: result,
            totalCount: Number(totalCount[0].count)
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
module.exports ={
    fetchAllBonus,
    fetchBonusById,
    createBonus,
    updateBonus,
    deleteBonus,
    searchDropDown,
    searchBonus,
    loadDropDown,
    normalizedRating,
    calculateBonus,
    uploadBonusFile,
    calculateBonusRating,
    bulkRating,
    calculateBulkBonus,
    calculateBulkBonus,
    downloadPgToXl,
    weightedBonus,
    bulkWeightedBonus,
    getAllReviewCycles,
    getAllCycles,
    getAllBonusesByReview
}