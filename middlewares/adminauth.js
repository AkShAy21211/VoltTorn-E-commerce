const is_Login = async(req,res,next)=>{

    try{

        if(req.session.user_id){

        }else{
            res.redirect('/admin')
        }

    }catch(error){
        console.log(error);
    }
    next();



}
const is_Logout = async(req,res,next)=>{

    try{

        if(req.session.user_id){

            res.redirect('/admin/drashboard')

        }else{

        }

    }catch(error){
        console.log(error);
    }
    next();



}

module.exports={
    is_Login,
    is_Logout
}