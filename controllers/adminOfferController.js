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


const addNewOffer = async (req, res) => {
    try {
        const { title, offerType, percentage, status, startDate, endDate } = req.body;

        // Input validation (you may need more validation based on your requirements)
        if (!title || !offerType || !percentage || !startDate || !endDate) {
            return res.status(400).send("Bad Request: Missing required fields");
        }

        let offer = "";
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
                // Handle unexpected offerType
                return res.status(400).send("Bad Request: Invalid offerType");
        }

        const offers = new offerModal({
            title: title,
            offerType: offerType,
            offer: offer,
            percentage: parseInt(percentage),
            isActive: status=='true' ? true : false,
            startDate: startDate,
            endDate: endDate,
        });

        await offers.save();
        req.flash('success', 'Offer Added Successfully');
        res.redirect('/admin/offer');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
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
const editOffer = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, offerType, percentage, status, startDate, endDate } = req.body;

        // Input validation (you may need more validation based on your requirements)
        if (!id || !title || !offerType || !percentage || !startDate || !endDate) {
            return res.status(400).send("Bad Request: Missing required fields");
        }

        let offer = "";
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
                // Handle unexpected offerType
                return res.status(400).send("Bad Request: Invalid offerType");
        }

        const updatedOfferData = {
            title: title,
            offerType: offerType,
            offer: offer,
            percentage: percentage,
            isActive: status=='true' ? true : false,
            startDate: startDate,
            endDate: endDate,
        }

        const Offer = await offerModal.findOneAndUpdate({ _id: id }, updatedOfferData, { new: true });

        if (!Offer) {
            return res.status(404).send("Not Found: Offer not found");
        }
        
        req.flash('success', 'Offer edited Successfully');
        res.redirect('/admin/offer');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports={

    loadOfferPage,
    addNewOffer,
    deleteOffer,
    loadOfferEdit,
    editOffer
}