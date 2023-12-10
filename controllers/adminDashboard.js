const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const getProductStatistics = async(req,res)=>{

    try{

        const totalProducts = await  productModel.find({}).countDocuments();
        const totalCustomers = await userModel.find({is_admin:0}).countDocuments();
        const amount = await userModel.aggregate([
            {
                $unwind: '$oders', // Deconstruct the orders array
              },
              {
                $match: {
                  $or: [
                    { 'oders.status': 'Delivered' },
                    { 'oders.payment': true },
                  ],
                },
              },
              {
                $group: {
                  _id: null,
                  totalAmount: { $sum: '$oders.totalAmount' },
                },
              },
        ])
        const Orders = await  userModel.aggregate([
            {
              $unwind: '$oders'// unwind each oders in oders array craete seprete documnts for each oders
            },
            {
              $group: { //now here group the documnts based on _id and count the total  numbers of oders using sum
                _id: '$_id',
                totalOrders: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                totalOrders: 1
              }
            }
          ]);
          

          const totalRevenue = amount.map(amount=> amount.totalAmount);
          const totalOrders = Orders.map(oders => oders.totalOrders);
        res.status(201).json({totalProducts,totalOrders,totalCustomers,totalRevenue})
    }catch(error){
        console.error(error);
    }
}




const searchItem = async(req,res)=>{

  try{

  const {query} = req.query;

    console.log(query);

  }catch(error){
    console.error(error);
  }
} 

module.exports = {

    getProductStatistics,
    searchItem
}