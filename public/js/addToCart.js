
const addToCartButtons = document.querySelectorAll('.addToCartButton');
const cartToast = document.getElementById('cart-toast');
const cartMessage = document.getElementById('cart-message');

addToCartButtons.forEach(button => {
    button.addEventListener('click', async () => {
        // Get product ID from data attribute
        const productId = button.dataset.productId;

        try {
            const response = await axios.post(`http://localhost:3000/home/products/cart/${productId}`);
            // Log the response data
            console.log('Response:', response.data);

            if (response.data.success) {
                // Update the toast message content

                // Show the toast
                cartMessage.innerHTML = response.data.message;
                cartToast.classList.add('show');

                // Hide the toast after a delay (e.g., 3000 milliseconds or 3 seconds)
                setTimeout(() => {
                    cartToast.classList.remove('show');
                }, 3000);
            } else {
                // Check if the response contains a redirect URL
                if (response.data.redirect) {
                    // Redirect to the specified URL (login page)
                    window.location.href = response.data.redirect;
                } else {
                    // Handle other error cases
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});




// Add event listener to all quantity inputs with the class 'quantity-input'
const quantityInputs = document.querySelectorAll('.quantity-input');

quantityInputs.forEach(input => {
    input.addEventListener('change', async () => {
        const productId = input.dataset.productId;
        const product = input.dataset.product;

        const newQuantity = input.value;

        try {
            const response = await axios.patch(`http://localhost:3000/home/products/cart/updateQuantity/${productId}/${product}`, { quantity: newQuantity });
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
