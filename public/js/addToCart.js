const addToCartButtons = document.querySelectorAll(".addToCartButton");
const cartToast = document.getElementById("cart-toast");
const cartMessage = document.getElementById("cart-message");



addToCartButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const productId = button.dataset.productId;
    const productPrice = parseFloat(button.dataset.productPrice);
    // ...

    try {


      const response = await axios.post(
        `http://localhost:3000/home/products/cart/${productId}`,
        { productPrice }
      );

      if (response.data.success) {
        // Display JSON message only if it exists and is not "undefined"
        if (response.data.message && response.data.message !== "undefined") {
          cartMessage.innerHTML = response.data.message;
          cartToast.classList.add("show");
        }

        // Hide the toast after a delay (e.g., 3000 milliseconds or 3 seconds)
        setTimeout(() => {
          cartToast.classList.remove("show");
          // Redirect after the delay
          window.location.href = "/home/cart";
        }, 2000);
      } else {

        //display login model if user is not logged in while trying to add to cart
        displayLoginModal();

      }
    } catch (error) {
      console.error("Error:", error);
    }

    // ...
  });
});

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}

function redirectLogin() {
  window.location.href = "/login";
}

//display popup modal if user try to add to cart without login
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
  input.addEventListener("change", async () => {
    const productId = input.dataset.productId;
    const product = input.dataset.product;
    const productPrice = parseFloat(input.dataset.productPrice);
    const newQuantity = input.value;

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
      

      if ( totalPriceElement && quantityElement && priceDetailElement) {

        setTimeout(() => {
          totalPriceElement.textContent = totalPrice.toFixed(2);
          quantityElement.textContent = newQuantity;
          priceDetailElement.textContent = updatedPrice.toFixed(2);
        }, 1000);
       
      }

      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  });
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
      cancelButtonText: 'Move to Wishlist',
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
        }
        console.log("Response:", response);
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Handle "Move to Wishlist" action
      // You can add the logic here to move the item to the wishlist
    }
  });
});
