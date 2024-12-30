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
    calculateBonusPercentage
} = require("../services/bonus.services");

const {updateNormalizedRating} = require("../models/bonus.model");

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
    const {id} = req.params;
    try {
        const result = await getBonusByIdService(id);
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
    uploadBonusFile
}