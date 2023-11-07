const productModel = require("../models/productModel");


const loadProduct = async(req,res)=>{
    try{

        res.render('products')


    }catch(error){
        console.log(error.meesage);
    }
}
const addProductLoad = async(req,res)=>{
    try{

        res.render('addProducts')


    }catch(error){
        console.log(error.meesage);
    }
}

module.exports = {
    loadProduct,
    addProductLoad
}