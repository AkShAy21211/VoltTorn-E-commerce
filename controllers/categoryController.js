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

    const Category = new categoryModel({
      category: name,
      description: description,
    });

    const CategoryData = await Category.save();
    console.log(CategoryData);
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
    res.render("editCategory", { CategoryData }); // Pass
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN EDIT CATEGORY   ROUTE


const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const description = req.body.description;

    const updateResult = await categoryModel.findOneAndUpdate(
      { _id: id },
      { category: name, description: description },
      { new: true }
      //  ensures that the updated document is returned
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
