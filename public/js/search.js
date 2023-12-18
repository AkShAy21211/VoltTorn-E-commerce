document.addEventListener("DOMContentLoaded", function () {
  // Get the search bar element
  var searchInput = document.getElementById("search-bar");
  const category = document.getElementById("category_name").value;

  console.log(category);
  // Add an input event listener to track changes
  searchInput.addEventListener("input", async function () {
    const searchQuery = searchInput.value;

    console.log(searchQuery);
    try {
      const response = await axios.get(
        `/home/products/${category}/search?value=${searchQuery}`
      );

      if (response.data) {
        ProductData = response.data.products;
        renderProducts(ProductData);
        if (response.data.products.length == 0) {
          document.getElementById("filterCount").innerHTML = `${response.data.products.length} Items found`;
        }else{
            document.getElementById("filterCount").innerHTML= `${response.data.products.length} Items found`;

        }
      }
    } catch (erorr) {
      console.error(error);
    }
  });

  function renderProducts(products) {
    const productContainer = $("#product-container");

    // Clear existing product container content
    productContainer.empty();

    // Render each product card and append to the container
    products.forEach((product) => {
      const productCard = `
      <div class="col-lg-4 col-md-6 col-sm-6  mt-xl-0 mt-lg-4 mt-md-5 mb-4 mt-sm-5 mt-5">
        <a href="/home/product/details/${
          product._id
        }" class="text-decoration-none text-dark">
          <div class="card border-0 h-100 p-2" id="product-card">
          <a  data-product-id="${product._id}" style="position: absolute; top: 0; left: 0; z-index: 10; font-size: 25px; text-decoration: none;color: rgb(243, 58, 58);" class="bi bi-suit-heart-fill heart p-2"></a>
            ${product.images
              .slice(0, 1)
              .map(
                (image) => `
              <img style="margin-bottom: 5px; background-size: cover;" width="50px" height="230px"
                class="card-img-top" src="/images/productImages/${image}"
                alt="Product Image 1" />
            `
              )
              .join("")}
            <div class="card-body" style="height: 130px;">
              <h6>${product.name.substring(0, 40, product.name.length / 2)}</h6>
              <p class="card-text" data-price="${Number(
                product.price - product.price * (product.discount / 100)
              )}">
                Price: <b>Rs:${Number(
                  product.price - product.price * (product.discount / 100)
                ).toLocaleString()}</b>
              </p>
              <div class="d-flex justify-content-between">
                <p class="card-text text-success">${product.discount}% off</p>
                <p class="small text-danger"><s>Rs${product.price}</s></p>
              </div>
            </div>
          </a>
          <button class="btn btn-outline-primary w-750 addToCartButton" data-product-id="${
            product._id
          }"
          data-product-price="${Number(
            product.price - product.price * (product.discount / 100)
          )}">Add to Cart</button>
    
          </div>
        
        
      </div>`;

      productContainer.append(productCard);
    });
  }
});
