const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");

//ADMIN CATEGORY PAGE LOAD

const loadCategory = async (req, res) => {
  try {
    const CategoryData = await categoryModel.find({});
    if (CategoryData) {
      res.render("category", { CategoryData });
    }
  } catch {
    console.log(error.message);
  }
};

//ADMIN ADD NEW CATEGORY

const addNewCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;
    const subCategory = req.body.SubCategory;
    const image = req.file.filename;

    // Check if the category with the given name already exists
    const existingCategory = await categoryModel.findOne({ category: name });

    if (existingCategory) {
      // If the category exists, update its sub_Category array
      existingCategory.sub_Category.push(subCategory);
      const updatedCategory = await existingCategory.save();
      console.log('Updated Category:', updatedCategory);
    } else {
      // If the category doesn't exist, create a new category
      const newCategory = new categoryModel({
        category: name,
        description: description,
        sub_Category: [subCategory], // Initialize the array with the new subcategory
        image: image,
      });

      const newCategoryData = await newCategory.save();
      console.log('New Category:', newCategoryData);
    }

    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};


//ADMIN EDIT CATEGORY PAGE LOAD ROUTE
const editCategoryLoad = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const CategoryData = await categoryModel.findOne({ _id: categoryId });
    const categorys = await categoryModel.find({});
    res.render("editCategory", { CategoryData,categorys}); // Pass
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN EDIT CATEGORY   ROUTE

const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const subCategory = req.body.subCategory;
    const description = req.body.description;
    const image = req.file ? req.file.filename : null; // Use null if no new image is provided

    const updateFields = { category: name, description: description, sub_Category: subCategory };

    if (image) {
      updateFields.image = image;
    }

    const updateResult = await categoryModel.findOneAndUpdate(
      { _id: id },
      updateFields,
      { new: true }
    );

    if (updateResult) {
      // Redirect to the category page after a successful update
      res.redirect("/admin/category");
    } else {
      res.status(500).send("Failed to update category");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


//ADMIN DELETE CATEGORY ROUTE

const deleteCategory  = async(req,res)=>{

  try{

    const id = req.params.id;
    const deleteCategory = await categoryModel.deleteOne({_id:id}); 
    if(deleteCategory){
      res.redirect('/admin/category');
    }

    

  }catch(error){
    console.log(error.message);
  }
}

module.exports = {
  addNewCategory,
  loadCategory,
  editCategoryLoad,
  editCategory,
  deleteCategory 
};
