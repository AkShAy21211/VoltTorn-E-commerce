const userModel = require("../models/userModel");
const returnModel = require("../models/returnModel");
const productModel = require("../models/productModel");
const { parseConnectionUrl } = require("nodemailer/lib/shared");

const loadOderManagment = async (req, res) => {
  try {
    const user = await userModel.find({ is_admin: 0 });
    const oders = user.flatMap((user) => user.oders);
    const returns = await returnModel.find({});
    const oderCount = oders.length;
    const oderedCustomers = oders.map((oders) => oders.customerName);
    const customers = oderedCustomers.length;

    res.render("oders", { oders, oderCount, customers, returns });
  } catch (error) {
    console.error(error);
  }
};

const adminChangeOderStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (status == "Delivered") {
      await userModel.findOneAndUpdate(
        { "oders._id": id },
        { $set: { "oders.$.status": status, "oders.$.payment": true } },
        { new: true }
      );
    } else {
      const updateStatus = await userModel.findOneAndUpdate(
        { "oders._id": id },
        { $set: { "oders.$.status": status } },
        { new: true }
      );
      return res.status(200).json({ updateStatus });
    }
  } catch (error) {
    console.error(error);
  }
};


const viewUserOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel
      .find({ 'oders._id': id });
  
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
  }
};

const viewReturnedOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const returns = await returnModel
      .find({ orderId: id })
      .populate("productId");
    console.log(returns);
    res.status(200).json({ returns });
  } catch (error) {
    console.error(error);
  }
};

const approveReturnedProduct = async (req, res) => {
  try {
    const { returnId } = req.params;
    const returnData = await returnModel.findById(returnId);
    const product = await productModel.findById(returnData.productId);
    let currentDate = new Date();
    const returnAmount = parseFloat(product.price * returnData.quantity) ;

    console.log(returnAmount);


    // Add 4 days to the current date
    currentDate.setDate(currentDate.getDate() + 4);
    
    // Format the date as a string (you can customize the format as needed)
    let formattedDate = currentDate.toISOString().split('T')[0];

    const updateReturnStatus = await returnModel.findOneAndUpdate(
      { _id: returnId },
      { $set: { status: "Approved"} },
      { new: true }
    );

  const user =   await userModel.findOneAndUpdate(
      {
        "oders._id": returnData.orderId,
        "oders.products.product_id": returnData.productId,
      },
      { $set: { "oders.$.products.$[product].returned": "Approved",'oders.$.pickDate':formattedDate } },
      {
        arrayFilters: [{ "product.product_id": returnData.productId }],
      },

      { new: true }
    );


      await userModel.findByIdAndUpdate(
        user._id,
        {
          $inc: { "wallet.balance": parseInt(returnAmount) }, // Subtract totalAmount from the balance
          $push: {
            "wallet.transactions": {
              type: "credit",
              amount: parseInt(returnAmount),
              timestamp: Date.now().toString(),
              description: "Amount for returned order credited successfully",
            },
          },
        },
        { new: true } // Return the updated document
      );

    

 

    res.status(200).json({ updateReturnStatus });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  loadOderManagment,
  viewUserOrder,
  adminChangeOderStatus,
  viewReturnedOrder,
  approveReturnedProduct,
};
