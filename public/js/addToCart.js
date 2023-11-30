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
        // Handle other cases (redirect, error messages, etc.)
      }
    } catch (error) {
      console.error("Error:", error);
    }

    // ...
  });
});

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
        `http://localhost:3000/home/products/cart/updateQuantity/${productId}/${product}`,
        { quantity: newQuantity, productPrice }
      );

      // Update the displayed price dynamically
      const updatedPrice = response.data.newProductPrice;
      const totalPrice = response.data.total_price;
      const totalPriceElement = document.querySelector('[data-total-price="total-price"]');

      const priceElement = input
        .closest("tr")
        .querySelector('[data-price="Price"]');



      console.log("Price Element:", priceElement); // Log to check the selected element
      console.log("Updated Price:", updatedPrice); // Log to check the updated price
      console.log("Updated total Price:", totalPrice); // Log to check the updated price


      if (priceElement && totalPriceElement ) {
        priceElement.textContent = updatedPrice.toFixed(2); // Assuming you want to display the price with two decimal places
        totalPriceElement.textContent = totalPrice.toFixed(2);
      }

      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
