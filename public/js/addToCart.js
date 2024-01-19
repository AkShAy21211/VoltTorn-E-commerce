
document.addEventListener("DOMContentLoaded",()=>{

document.addEventListener("click", async (event) => {
  // Check if the clicked element is an "Add to Cart" button
  if (event.target.classList.contains("addToCartButton")) {
    // Get the clicked button and its data attributes
    const button = event.target;
    const productId = button.dataset.productId;
    const productPrice = parseFloat(button.dataset.productPrice);

    try {
      const response = await axios.post(
        `/home/products/cart/${productId}`,
        { productPrice }
      );
     
   
      if (response.data.success) {


      
        // Display toast message
        if (response.data.message && response.data.message !== "undefined") {
          const blueGradients = [
            "linear-gradient(to right, #0074cc, #0076cc)",
            "linear-gradient(to right, #004080, #0066cc)",
            "linear-gradient(to right, #006080, #0080cc)",
            "linear-gradient(to right, #003366, #0055b2)",
            "linear-gradient(to right, #005080, #0070cc)",
          ];

          const randomGradient = blueGradients[Math.floor(Math.random() * blueGradients.length)];

          Toastify({
            text: response.data.message,
            duration: 3000,
            close: true,
            gravity: "top",
            width:"90%",
            position: "right",
            stopOnFocus: true,
            style: {
              background: randomGradient,
              marginTop: "60px",
              width: "auto", // Allow the width to adjust based on content
              whiteSpace: "nowrap", // Prevent text from wrapping
              overflow: "hidden", // Hide content that overflows the width


            },
            onClick: function () {},
          }).showToast();

          const cart = document.getElementById('cart-item-count');
          cart.innerText = response.data.cartCount

          console.log(cart.innerHTML);
  
        }
      } else {
        // Display login modal if the user is not logged in while trying to add to cart
        displayLoginModal();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }else if(event.target.classList.contains("buyNowButton")){
    const button = event.target;
    const productId = button.dataset.productId;
    const productPrice = parseFloat(button.dataset.productPrice);

    try {
      const response = await axios.post(
        `/home/products/buy-now/${productId}`,
        { productPrice }
      );

      if (response.data.success) {

        window.location.href='/home/cart'
        // Display toast message
        // if (response.data.message && response.data.message !== "undefined") {
        //   const blueGradients = [
        //     "linear-gradient(to right, #0074cc, #0076cc)",
        //     "linear-gradient(to right, #004080, #0066cc)",
        //     "linear-gradient(to right, #006080, #0080cc)",
        //     "linear-gradient(to right, #003366, #0055b2)",
        //     "linear-gradient(to right, #005080, #0070cc)",
        //   ];

        //   const randomGradient = blueGradients[Math.floor(Math.random() * blueGradients.length)];

        //   Toastify({
        //     text: response.data.message,
        //     duration: 3000,
        //     newWindow: true,
        //     close: true,
        //     gravity: "top",
        //     position: "right",
        //     stopOnFocus: true,
        //     style: {
        //       background: randomGradient,
        //       marginTop: "60px",
        //     },
        //     onClick: function () {},
        //   }).showToast();
        // }
      } else {
        // Display login modal if the user is not logged in while trying to add to cart
        displayLoginModal();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
});
})

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}



function displayLoginModal() {
  // Get the modal element
  const modal = document.getElementById("loginModal");

  // Get the <span> element that closes the modal
  const closeBtn = modal.querySelector(".close");

  // Display the modal
  modal.style.display = "block";

  // Close the modal when the close button is clicked
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Redirect to login page after a delay (e.g., 3000 milliseconds or 3 seconds)
  
}




// Add event listener to all quantity inputs with the class 'quantity-input'

const quantityInputs = document.querySelectorAll(".quantity-input");

quantityInputs.forEach((input) => {
  const productId = input.dataset.productId;
  const product = input.dataset.product;
  const productPrice = parseFloat(input.dataset.productPrice);
  const error_id = input.dataset.error;


  const plusBtn = input.nextElementSibling;
  const minusBtn = input.previousElementSibling;

  plusBtn.addEventListener("click", async () => {
    input.stepUp();
    handleQuantityChange(input.value);
  });

  minusBtn.addEventListener("click", async () => {
    input.stepDown();
    handleQuantityChange(input.value);
  });

  input.addEventListener("change", async () => {
    handleQuantityChange(input.value);
  });

  async function handleQuantityChange(newQuantity) {
    try {
      const response = await axios.patch(
        `/home/products/cart/updateQuantity/${productId}/${product}`,
        { quantity: newQuantity, productPrice }
      );

      const updatedPrice = response.data.newProductPrice;
      const totalPrice = response.data.total_price;

      const totalPriceElement = document.querySelector('[data-total-price="total-price"]');
      const quantityElement = document.querySelector(`.quantity[data-product-id="${product}"]`);
      const priceDetailElement = document.querySelector(`.price[data-product-id="${product}"]`);


      if (totalPriceElement && quantityElement && priceDetailElement) {
        const errorElement = document.querySelector(`.stock-error[data-product-id="${error_id}"]`);

        console.log(errorElement);
        errorElement.textContent = "";
        setTimeout(() => {
          totalPriceElement.textContent = totalPrice.toFixed(2);
          quantityElement.textContent = newQuantity;
          priceDetailElement.textContent = updatedPrice.toFixed(2);
        }, 1000);
      }

      console.log("Response:", response.data);
    } catch (error) {
      const errorElement = document.querySelector(`.stock-error[data-product-id="${error_id}"]`);

      console.log(errorElement);
      errorElement.textContent = error.response.data.error;
    
    }
  }
});

// Assuming you have a delete button with the class "delete-item"
const deleteCartItemButtons = document.querySelectorAll(".delete-item");

deleteCartItemButtons.forEach((deleteButton) => {
    deleteButton.addEventListener("click", async () => {
    const deleteItemId = deleteButton.dataset.deleteItem;
    const cartItemRow = document.querySelector(`tr[data-cart-item-id="${deleteItemId}"]`);
    const totalPriceElement = document.querySelector('[data-total-price="total-price"]');
    const userCartCount = document.querySelector(`[data-item-quantity="userCartCount"]`);
    const checkoutItmesId = document.querySelector(`.checkout[data-checkout-items-id="${deleteItemId}"]`);

    // Display confirmation box
    const result = await Swal.fire({
      text: 'Do you want to remove this item?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      width:"300px",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`/home/cart/${deleteItemId}`);
        const totalPrice = response.data.total_price;
        const cartCount = response.data.userCartCount;

        if (response.data.updatedCart && totalPrice) {
          setTimeout(() => {
            userCartCount.textContent = cartCount;
            cartItemRow.remove();
            checkoutItmesId.remove();
            totalPriceElement.textContent = totalPrice.toFixed(2);
          }, 1000);


          const cart = document.getElementById('cart-item-count');
          cart.innerText = response.data.userCartCount;
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Handle "Move to Wishlist" action
      // You can add the logic here to move the item to the wishlist
    }
  });
});
