const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const ExcelJS = require("exceljs");

const getProductStatistics = async (req, res) => {
  try {
    let dateObj = new Date();
    const totalProducts = await productModel.find({}).countDocuments();
    const user = await userModel.find({ is_admin: 0 });
    const oders = user.flatMap((user) => user.oders);
    const oderCount = oders.length;
    const totalCustomers = await userModel
      .find({ is_admin: 0 })
      .countDocuments();

      //get online and cod payment statictits
      const paymentModeCounts = await userModel.aggregate([
        { $unwind: "$oders" },
        {
          $match: {
            "oders.payment_mode": { $in: ["online", "COD","wallet"] },
          },
        },
        {
          $group: {
            _id: "$oders.payment_mode",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            paymentMode: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);
      
      
      console.log(paymentModeCounts);




    const amount = await userModel.aggregate([
      {
        $unwind: "$oders", // Deconstruct the orders array
      },
      {
        $match: {
          $or: [{ "oders.status": "Delivered" }, { "oders.payment": true }],
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$oders.totalAmount" },
        },
      },
    ]);

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, new Date().getMonth() - 11, 1);


    const monthlyRevenue = await userModel.aggregate([
      // Unwind the orders array to flatten it
      { $unwind: "$oders" },

      // Match orders within the desired date range
      {
        $match: {
          "oders.date": {
            $gte: startDate,
            
          },
          "oders.status": "Delivered",
        },
      },

      // Group by year and month, calculate the total revenue
      {
        $group: {
          _id: {
            year: { $year: "$oders.date" },
            month: { $month: "$oders.date" },
          },
          monthlyRevenue: { $sum: "$oders.totalAmount" },
        },
      },

      // Project to rename the fields and include the year and month
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          monthlyRevenue: 1,
        },
      },

      // Sort by year and month
      { $sort: { year: 1, month: 1 } },
    ]);

    // Format the result as an array with 12 elements, where each index corresponds to a month
    let formattedMonthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const monthData = monthlyRevenue.find((data) => data.month === index + 1);
      return monthData ? monthData.monthlyRevenue : 0;
    });

    

    const yearlyRevenue = await userModel.aggregate([
      // Unwind the orders array to flatten it
      { $unwind: "$oders" },
    
      // Match orders within the desired date range
      {
        $match: {
          "oders.date": {
            $lte: new Date(currentYear, 11, 31), // End of the current year
          },
          "oders.status": "Delivered",
        },
      },
    
      // Group by year, calculate the total revenue
      {
        $group: {
          _id: {
            year: { $year: "$oders.date" },
          },
          yearlyRevenue: { $sum: "$oders.totalAmount" },
        },
      },
    
      // Project to rename the fields
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          yearlyRevenue: 1,
        },
      },
    
      // Sort by year
      { $sort: { year: 1 } },
    ]);
    
    
    const yearsSinceStart = currentYear - 2022 + 1;

    // Format the result as an array
    let formattedYearlyRevenue = Array.from({ length: yearsSinceStart }, (_, index) => {
      const yearlyData = yearlyRevenue.find((data) => data.year === currentYear - index);
      return yearlyData ? yearlyData.yearlyRevenue : 0;
    });
    
    formattedYearlyRevenue.reverse()


    


    const monthlySales = await userModel.aggregate([
      // Unwind the orders array to get a separate document for each order
      { $unwind: "$oders" },
      // Unwind the products array to get a separate document for each product in the order
      { $unwind: "$oders.products" },
      {
        $match: {
          "oders.date": {
            $lte: new Date(currentYear, 11, 31), // End of the current year
          },
          "oders.status": "Delivered",
        },
      },
      {
        $project: {
          month: { $month: "$oders.date" }, // Extract month from the order date
          quantity: "$oders.products.quantity",
        },
      },
      // Group by month and sum the quantities
      {
        $group: {
          _id: "$month",
          totalSales: { $sum: "$quantity" },
        },
      },
      // Sort by month
      { $sort: { _id: 1 } },
      // Project to rename the _id field to month
      {
        $project: {
          month: "$_id",
          totalSales: 1,
          _id: 0,
        },
      },
    ]);
    const formattedMonthlySales = Array.from({ length: 12 }, (_, index) => {
      const monthData = monthlySales.find((data) => data.month === index + 1);
      return monthData ? monthData.totalSales : 0;
    });
    




    const yearlySales = await userModel.aggregate([
      // Unwind the orders array to get a separate document for each order
      { $unwind: "$oders" },
      // Unwind the products array to get a separate document for each product in the order
      { $unwind: "$oders.products" },
      {
        $match: {
          "oders.status": "Delivered",
        },
      },
      {
        $project: {
          year: { $year: "$oders.date" }, // Extract year from the order date
          quantity: "$oders.products.quantity",
        },
      },
      // Group by year and sum the quantities
      {
        $group: {
          _id: {
            year: "$year",
          },
          totalSales: { $sum: "$quantity" },
        },
      },
      // Sort by year
      { $sort: { "_id.year": 1 } },
      // Project to rename the _id field to year
      {
        $project: {
          year: "$_id.year",
          totalSales: 1,
          _id: 0,
        },
      },
    ]);
    




    
    const formattedYearlySales = Array.from({ length: yearsSinceStart }, (_, index) => {
      const yearData = yearlySales.find((data) => data.year === currentYear - index);
      return yearData ? yearData.totalSales : 0;
    });
    
    
     formattedYearlySales.reverse()

    const pipeline = [
      {
        $lookup: {
          from: "products", // Replace "products" with the actual name of your product collection
          localField: "category",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: { $size: "$products" } },
        },
      },
   
    ];
    
    // Execute the aggregate pipeline
    const result = await categoryModel.aggregate(pipeline);
    const productCounts = result.map(category => category.productCount);
    const categoryNames = result.map(category => category._id);



    

    const totalRevenue = amount.map((amount) => amount.totalAmount);
    res.status(200).json({
        totalProducts,
        oderCount,
        totalCustomers,
        totalRevenue,
        formattedMonthlyRevenue,
        formattedYearlyRevenue,
        formattedMonthlySales,
        formattedYearlySales,
        productCounts,
        categoryNames,
        paymentModeCounts
    
      });
  } catch (error) {
    console.error(error);
  }
};




const downlodeSalesReport = async (req, res) => {
  const { reportType } = req.query;

  console.log(reportType);
  const currentTime = new Date();
  let startDate;

  // Calculate the start date based on the report type
  if (reportType === "weekly") {
    startDate = new Date(currentTime);
    startDate.setDate(currentTime.getDate() - 7);
  } else if (reportType === "monthly") {
    startDate = new Date(currentTime);
    startDate.setMonth(currentTime.getMonth() - 1);
  } else if (reportType === "yearly") {
    startDate = new Date(currentTime);
    startDate.setFullYear(currentTime.getFullYear() - 1);
  } else {
    throw new Error("Invalid report type");
  }

  try {
    const users = await userModel
      .find({
        "oders.date": { $gte: startDate, $lte: currentTime },
      })
      .populate("oders");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Mobile', key: 'mobile', width: 20 },
      { header: 'Order ID', key: 'orderId', width: 20 },
      { header: 'Order Date', key: 'orderDate', width: 20 },
      { header: 'Product Name', key: 'productName', width: 20 },
      { header: 'Product Quantity', key: 'productQuantity', width: 20 },
      { header: 'Total Amount', key: 'Amount', width: 20 },
      // Add more columns as needed
    ];

    // Populate the worksheet with data
    users.forEach((user) => {
      user.oders.forEach((order) => {
        order.products.forEach((product) => {
          worksheet.addRow({
            username: user.first_name + ' ' + user.last_name,
            email: user.email,
            mobile: user.mobile,
            orderId: order._id.toString(),
            orderDate: order.date.toISOString(), // You may need to format the date appropriately
            productName: product.name,
            productQuantity: product.quantity,
            Amount: order.totalAmount,
            // Add more columns as needed
          });
        });
      });
    });

    // Set the response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

    // Write the workbook to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();

    console.log('Excel file sent for download successfully.');
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
};



const downlodeSalesReportPdf = async (req, res) => {
  const { reportType } = req.query;

  console.log(reportType);
  const currentTime = new Date();
  let startDate;

  // Calculate the start date based on the report type
  if (reportType === "weekly") {
    startDate = new Date(currentTime);
    startDate.setDate(currentTime.getDate() - 7);
  } else if (reportType === "monthly") {
    startDate = new Date(currentTime);
    startDate.setMonth(currentTime.getMonth() - 1);
  } else if (reportType === "yearly") {
    startDate = new Date(currentTime);
    startDate.setFullYear(currentTime.getFullYear() - 1);
  } else {
    throw new Error("Invalid report type");
  }

  try {
    const users = await userModel
      .find({
        "oders.date": { $gte: startDate, $lte: currentTime },
      })
      .populate("oders");

    
    const salesReport = [];

    // Populate the worksheet with data
    users.forEach((user) => {
      user.oders.forEach((order) => {
        order.products.forEach((product) => {
          if (order.date >= startDate && order.date <= currentTime) {

            const reportEntry = {
        username: user.first_name + ' ' + user.last_name,
            email: user.email,
            mobile: user.mobile,
            orderId: order._id.toString(),
            orderDate: order.date.toISOString(), // You may need to format the date appropriately
            productName: product.name,
            productQuantity: product.quantity,
            price:product.price,
            Amount: order.totalAmount,
            // Add more columns as needed
          };
          salesReport.push(reportEntry)

        };
        });
      });
    });

    res.status(200).json({ salesReport });
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
};




module.exports = {
  getProductStatistics,
  // searchItem,
  downlodeSalesReport,
  downlodeSalesReportPdf
};
