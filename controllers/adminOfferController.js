const offerModal = require("../models/offerModal");
const categoryModal = require("../models/categoryModel");


const loadOfferPage = async(req,res)=>{

    try{
        const offers = await offerModal.find({});
        const category = await categoryModal.find({});

        res.render('offer',{offers,category});

    }catch(error){
        console.error(error);
    }
}


const addNewOffer = async(req,res)=>{

    try{

        const {title,offerType,percentage,status,startDate,endDate} = req.body;
        let offer;
        switch (offerType) {
            case 'Category':
                offer = req.body.category;
              break;
            case 'Product':
                offer = req.body.productName;
              break;
            case 'Referral':
                offer = req.body.referral;
              break;
            default:
                offer = "";

          }

          const offers = new offerModal({
            title:title,
            offerType:offerType,
            offer:offer,
            percentage:percentage,
            isActive:!status?false:true,
            startDate:startDate,
            endDate:endDate,

          });

          await offers.save();
      
          res.redirect('/admin/offer')
  
    }catch(error){
        console.error(error);
    }
}


const deleteOffer = async(req,res)=>{

    try{

        const {id} = req.query;
        console.log(id);
        await offerModal.findByIdAndDelete(id);
        res.redirect('/admin/offer')

    }catch(error){
        console.error(error);
    }
}

const loadOfferEdit =  async(req,res)=>{

    try{
        const id = req.params.id;
        const category = await categoryModal.find({});
        const Offer = await offerModal.findOne({_id:id});
        res.render('editOffers',{category,Offer})

    }catch(error){
        console.error(error);
    }
}
const editOffer =  async(req,res)=>{

    try{
        const id = req.params.id;
        const {title,offerType,percentage,status,startDate,endDate} = req.body;
        let offer;
        switch (offerType) {
            case 'Category':
                offer = req.body.category;
              break;
            case 'Product':
                offer = req.body.productName;
              break;
            case 'Referral':
                offer = req.body.referral;
              break;
            default:
                offer = "";

          }
          const updatedOfferData = {
            title:title,
            offerType:offerType,
            offer:offer,
            percentage:percentage,
            status:status,
            startDate:startDate,
            endDate:endDate,


          }
        const Offer = await offerModal.findOneAndUpdate({_id:id},updatedOfferData,{new:true});
        res.redirect('/admin/offer')

    }catch(error){
        console.error(error);
    }
}
module.exports={

    loadOfferPage,
    addNewOffer,
    deleteOffer,
    loadOfferEdit,
    editOffer
}