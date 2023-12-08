let timerOn = true;
let timerExpired = false; // Flag to indicate whether the timer has expired

function timer(remaining) {
  var m = Math.floor(remaining / 60);
  var s = remaining % 60;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;
  remaining -= 1;

  if (remaining >= 0 && timerOn) {
    setTimeout(function () {
      timer(remaining);
    }, 1000);

    // Show the countdown
    document.getElementById("countdown").innerHTML = `Time left: ${m}:${s}`;

    return;
  }

  // Timer has expired
  timerExpired = true;

  // Show the Resend link
 const resendElement =  document.getElementById("resend").innerHTML = `Don't receive the code? `;
}

timer(60);

async function resendOTP() {

  const resendElement =  document.getElementById("resend");


  try{
    
  const resend  = await axios.post('/verify/resend-otp')
  console.log(resend.data);
  if(resend.data.deleteOtp){

    console.log(resend.data.deleteOtp);

    resendElement.removeChild();



  }

  }catch(error){
    console.error(error);
  }

}