document.getElementById("eye1").addEventListener('click',function(){

    var x =document.getElementById("password1");

    if(x.type=='password'){

       x.type='text';
       this.classList.add("fa-eye");
       this.classList.remove("fa-eye-slash")

    }else{
       x.type='password';
       this.classList.remove("fa-eye");

       this.classList.add("fa-eye-slash")


    }

});

document.getElementById("eye2").addEventListener('click',function(){

    var x =document.getElementById("password2");

    if(x.type=='password'){

       x.type='text';
       this.classList.add("fa-eye");
       this.classList.remove("fa-eye-slash")

    }else{
       x.type='password';
       this.classList.remove("fa-eye");

       this.classList.add("fa-eye-slash")


    }

});