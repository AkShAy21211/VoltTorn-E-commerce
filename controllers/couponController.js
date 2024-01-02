const { end } = require("pdfkit");
const couponModal = require("../models/couponModal");

const loadCouponPage = async(req,res)=>{

    try{
        const coupon = await couponModal.find({});

        res.render('coupon',{coupon});

    }catch(error){

        console.error(error);
    }
}
const addCoupon = async(req,res)=>{

    try{

        const {code,percentage,endDate,minAmount,status}= req.body;

        console.log(code,percentage,endDate,minAmount,status);

        const coupon = new couponModal({

            code:code,
            discountPercentage:parseInt(percentage),
            expiry:endDate,
            minOrderAmount:parseInt(minAmount),
            isActive:status,


        });


        await coupon.save();


        res.redirect('/admin/coupon')


    }catch(error){

        console.error(error);
    }
}
const editCouponLoad = async(req,res)=>{

    try{
        const coupon = await couponModal.findById({_id:req.params.id});

        res.render('editCoupon',{coupon});


    }catch(error){

        console.error(error);
    }
}
const editCoupon = async(req,res)=>{

    try{
        const id = req.params.id;
        const {code,percentage,endDate,minAmount,status}= req.body;

        console.log(code,percentage,endDate,minAmount,status);
        const updateData = {

            code:code,
            discountPercentage:parseInt(percentage),
            expiry:endDate,
            minOrderAmount:parseInt(minAmount),
            isActive:status,
        }

        const updateCoupon = await couponModal.findOneAndUpdate({_id:id},{$set:updateData});

        res.redirect(`/admin/coupon/edit/${id}`);
        


    }catch(error){

        console.error(error);
    }
}

const deleteCoupon = async(req,res)=>{

    try{

        const id = req.params.id;
        await couponModal.findByIdAndDelete(id);
        res.redirect(`/admin/coupon`);

    
    }catch(error){

        console.error(error);
    }
}
module.exports ={

    loadCouponPage,
    addCoupon,
    editCoupon,
    editCouponLoad,
    deleteCoupon
}