// Add an event listener to the common ancestor (e.g., document or a specific container)
document.addEventListener("click", async (event) => {
  // Check if the clicked element is a "heart" button
  if (event.target.classList.contains("heart")) {
    // Get the clicked heart button and its data attributes
    const heart = event.target;
    const productId = heart.dataset.productId;

    try {
      // You can now use the productId in your request or perform any other action
      const response = await axios.get(`/home/products/wishlist/${productId}`);

    

      if (response.data.success) {
        // Array of blue gradient color combinations
        const blueGradients = [
          "linear-gradient(to right, #0074cc, #0076cc)",
          "linear-gradient(to right, #004080, #0066cc)",
          "linear-gradient(to right, #006080, #0080cc)",
          "linear-gradient(to right, #003366, #0055b2)",
          "linear-gradient(to right, #005080, #0070cc)",
          // Add more color combinations as needed
        ];
        const wish  = document.getElementById('wish-item-count');
        wish.innerText = response.data.wishCount;

        console.log(response.data);
        // Select a random gradient from the array
        const randomGradient =
          blueGradients[Math.floor(Math.random() * blueGradients.length)];

        // Use the selected gradient for the toast
        Toastify({
          text: response.data.success,
          duration: 3000,
          newWindow: true,
          close: true,
          width:"90%",
          gravity: "top", // `top` or `bottom`
          position: "right", // `left`, `center`, or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: randomGradient,
            marginTop: "60px",
            width: "auto", // Allow the width to adjust based on content
            whiteSpace: "nowrap", // Prevent text from wrapping

          },
          onClick: function () {}, // Callback after click
        }).showToast();
      }else{
        displayLoginModal();

      }
    } catch (error) {
        
      console.error(error);
    }
  }
});


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
