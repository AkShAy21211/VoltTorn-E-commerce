const lens = document.getElementsByClassName("magnifier-lens")[0];
const productImage = document.getElementsByClassName("product-image")[0];
const magnifiedImage = document.getElementsByClassName("magnified-image")[0];
const largeiamge = document.getElementById("largeImage");

function magnify(productImage, magnifiedImage) {
  lens.addEventListener("mousemove", moveLens);
  productImage.addEventListener("mousemove", moveLens);

  //take mouse out of image
  productImage.addEventListener("mouseout", leaveLens);

}

function moveLens(e) {
  console.log("x: " + e.pageX + " Y: " + e.pageY);
  let x, y, cx, cy;

  //get the position of crusor

const product_img_rect = productImage.getBoundingClientRect()
  x=e.pageX - product_img_rect.left - lens.offsetWidth/2;
  y=e.pageY - product_img_rect.top - lens.offsetHeight/2;
  

  let max_xpos = product_img_rect.width - lens.offsetWidth;
  let max_ypos = product_img_rect.height - lens.offsetHeight;

  if(x  > max_xpos) 
  x = max_xpos;

  if(x< 0)
  x= 0;


  if(y  > max_ypos) 
  y = max_ypos;

  if(y< 0)
  y= 0;

  lens.style.cssText=`top:${y}px; left:${x}px`

  //calculate the magnified _img and lens aspet ratio

  cx = magnifiedImage.offsetWidth / lens.offsetWidth;
  cy = magnifiedImage.offsetHeight / lens.offsetHeight;


  magnifiedImage.style.cssText = `background: url("${largeImage.src}")
  -${x * cx}px -${y * cy}px  /
  ${product_img_rect.width * cx}px ${product_img_rect.height * cy}px
  no-repeat;
`;
lens.classList.add("active")

magnifiedImage.classList.add("active")



}

function leaveLens(){
    lens.classList.remove("active")
    magnifiedImage.classList.remove("active")


}

magnify(productImage, magnifiedImage);
