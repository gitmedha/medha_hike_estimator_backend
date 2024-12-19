const {
    fetchAllBonusService,
    searchDropDownService,
    searchBonusService,
    createBonusService,
    getBonusByIdService,
    getPickLists,
    updateBonusService
} = require("../services/bonus.services");

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
        console.log(result, "result")
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
 
}

const createBonus = async(req,res)=>{
    const {data} = req.body;
    try {
        const result = await createBonusService(data);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
 
}

const updateBonus = async(req,res)=>{
    const {id, data} = req.body;
    try {
        const result = await updateBonusService(id, data);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", error: error.message})
    }
 
}

const deleteBonus = async(req,res)=>{

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

}

const calculateBonus = async(req,res)=>{

};

 
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
    calculateBonus
}