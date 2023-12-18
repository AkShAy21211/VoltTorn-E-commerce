var hearts = document.querySelectorAll(".heart");

hearts.forEach(function (heart) {
  const productId = heart.dataset.productId; // Access the data-product-id attribute

  heart.addEventListener("click", async function () {
    try {
      console.log(productId);
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

        // Select a random gradient from the array
        const randomGradient =
          blueGradients[Math.floor(Math.random() * blueGradients.length)];

        // Use the selected gradient for the toast
        Toastify({
          text: response.data.success,
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top", // `top` or `bottom`
          position: "right", // `left`, `center`, or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: randomGradient,
            marginTop: "60px", // Add margin-top as needed
          },
          onClick: function () {}, // Callback after click
        }).showToast();
      }
    } catch (error) {
      console.error(error);
    }
  });
});
