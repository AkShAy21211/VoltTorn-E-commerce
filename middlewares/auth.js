const is_Login = async(req,res,next)=>{

    try{

        if(req.session.user_id){

        }else{

            res.redirect('/')
        }
        next()
        
        
    }catch(error){
        console.log(error.message);
    }
}

const is_Logout = async(req,res,next)=>{

    try{

        if(req.session.user_id){

            res.redirect('/home');
        }
        next();

        
        
    }catch(error){
        console.log(error.message);
    }
}

module.exports ={
    is_Login,
    is_Logout,
}