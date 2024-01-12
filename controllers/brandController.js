const brandModel = require("../models/brandModel");
const categoryModel = require("../models/brandModel");

//ADMIN CATEGORY PAGE LOAD

const loadBrand = async (req, res) => {
  try {
    const BrandData = await brandModel.find({});
    if (BrandData) {
      res.render("brand", { BrandData });
    }
  } catch {
    console.log(error.message);
  }
};

//ADMIN ADD NEW CATEGORY

const addNewBrand = async (req, res) => {
  try {
    const {name,description,status} = req.body;
    const image = req.file.filename?req.file.filename:"";

    console.log(name,description,status,image);
    // Check if the category with the given name already exists
    const existingBrand = await brandModel.findOne({ name: { $regex: new RegExp("^" + name, "i") } });

    if (existingBrand) {

        res.render('brand',{error:"Brand already exists"});
  
    } else {
      // If the category doesn't exist, create a new category
      const newBrand = new brandModel({
        name: name,
        description: description,
        logo: image,
        status:status,
      });

      const newBrandData = await newBrand.save();
      console.log('New brand:', newBrandData);
    }

    res.redirect("/admin/brand");
  } catch (error) {
    console.log(error.message);
  }
};


//ADMIN EDIT CATEGORY PAGE LOAD ROUTE
const editBrandLoad = async (req, res) => {
  try {
    const brandId = req.params.id;
    const brandData = await brandModel.findOne({ _id: brandId });
    res.render("editBrand", { brandData}); // Pass
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN EDIT CATEGORY   ROUTE

const editBrand = async (req, res) => {
  try {
    const id = req.params.id;
    const {name,description,status} = req.body;
    const image = req.file ? req.file.filename : null; // Use null if no new image is provided
    const updateFields = { name: name, description: description, status: status };

    if (image) {
      updateFields.image = image;
    }

    const updateResult = await brandModel.findOneAndUpdate(
      { _id: id },
      updateFields,
      { new: true }
    );

    if (updateResult) {
      // Redirect to the category page after a successful update
      res.redirect("/admin/brand");
    } else {
      res.status(500).send("Failed to update category");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


//ADMIN DELETE CATEGORY ROUTE

const deleteBrand = async(req,res)=>{
  try{
    const {id} = req.params;
    const deleteBrand = await brandModel.findByIdAndDelete(id.trim());
    if(deleteBrand){
      res.redirect('/admin/brand');
    }
  }catch(error){
    console.log(error.message);
  }
}

module.exports = {
  addNewBrand,
  loadBrand,
  editBrandLoad,
  editBrand,
  deleteBrand 
};
