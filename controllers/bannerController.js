const bannerModel = require("../models/bannerModel");

const loadBannerPage = async (req,res)=>{

    const banner = await bannerModel.find({});
    try{

        res.render('banner',{banner})

    }catch(error){
        console.error(error);
    }
}

const addNewBannerByAdmin = async (req, res) => {
    try {
      const { name, startDate, endDate } = req.body;
  
      // Assuming you're using multer for handling file uploads
      const images = req.file.filename;
      console.log(images);
  
      const banner = new bannerModel({
        name:name,
        image:images,
        startDate:startDate,
        endDate:endDate,
      });
     await banner.save();

    res.redirect('/admin/banners'); // Redirect to the banner list page
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};  

const deleteBannerByAdmin = async(req,res)=>{
  try{


    const {id} =req.params;
    const bannerData = await bannerModel.findByIdAndDelete(id);
    res.redirect('/admin/banners');

  }catch(error){
    console.error(error);
  }
}

const editeBannerByAdminGet = async(req,res)=>{
  try{


    const {id} =req.params;
    const banner = await bannerModel.findById(id);
    res.render('editBanner',{banner});

  }catch(error){
    console.error(error);
  }
}

const editBannerByAdminPost = async (req, res) => {
  try {
      const { id } = req.params;
      const { name, startDate, endDate } = req.body;
      const image = req.file ? req.file.filename : null; // Check if req.file exists
      const banner = await bannerModel.findById(id);
      const previousImage = banner.image;

 
      if (banner) {
          if (image) {
              await bannerModel.findOneAndUpdate({ _id: id }, { name, startDate, endDate, image });
              console.log("Banner updated with new image.");
          } else {
              await bannerModel.findOneAndUpdate({ _id: id }, { name, startDate, endDate, image: previousImage });
              console.log("Banner updated without changing the image.");
          }

          res.redirect('/admin/banners');
      } else {
          console.log("No banner found.");
          res.status(500).send("No banner found");
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};

module.exports ={

    loadBannerPage,
    addNewBannerByAdmin,
    deleteBannerByAdmin,
    editeBannerByAdminGet,
    editBannerByAdminPost,
}