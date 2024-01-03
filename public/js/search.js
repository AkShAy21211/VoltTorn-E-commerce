document.addEventListener("DOMContentLoaded", function () {
  // Get the search bar element
  var searchInput = document.getElementById("search-bar");
  const category = document.getElementById("category_name").value;
  let offer;

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
        offer = response.data.offer;
        console.log(offer);
        renderProducts(ProductData);
        if (response.data.products.length == 0) {
          document.getElementById(
            "filterCount"
          ).innerHTML = `${response.data.products.length} Items found`;
        } else {
          document.getElementById(
            "filterCount"
          ).innerHTML = `${response.data.products.length} Items found`;
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  function renderProducts(products) {
    const productContainer = $("#product-container");

    // Clear existing product container content
    productContainer.empty();

    // Render each product card and append to the container
    products.forEach((product, index) => {

      
      const stock = product.stock < 1 ? `
      <div class="d-flex justify-content-between">
    <h6 class="text-warning mt-4 p-3">Out of stock</h6>
    <button data-product-id="${product._id}" style="font-size: 25px; text-decoration: none; color: rgb(243, 58, 58);" class="bi bi-suit-heart-fill heart bg-white border-0"></button>

    </div>` : ` <div class="d-flex justify-content-between">
      <button style="font-size: 25px;" class=" addToCartButton bi bi-cart4 text-primary  bg-white border-0"  data-product-id="${product._id}"
        data-product-price="${Number(product.price - (product.price * (product.discount / 100)))}">
      </button>
      <button data-product-id="${product._id}" style="font-size: 25px; text-decoration: none; color: rgb(243, 58, 58);" class="bi bi-suit-heart-fill heart bg-white border-0"></button>

    </div>`;
    
      const productCard = `
      <div class="col-lg-4 col-md-6 col-sm-6 mt-xl-0 mt-lg-2 mt-md-3 mb-4 mt-sm-4 mt-4 p-3">
          <!-- Use col-lg-4 to include three cards in one row -->

          <a href="/home/product/details/${
            product._id
          }" class="text-decoration-none text-dark ">

            <div class="card border-0 h-100 p-2 " id="product-card-${index}">

              <div class="offer-container" id="offer-container-${index}"></div>

              <img style="margin-bottom: 5px; background-size: cover;" width="50px" height="230px"
                class="card-img-top" src="/images/productImages/${
                  product.images[0]
                }" alt="Product Image " />
              <div class="card-body" style="height: 130px;">
                <div style="display: flex; justify-content: start; margin-bottom: 10px; text-align: start;">

                  <h6>
                    ${product.name.substring(0, 40, product.name.length / 2)}
                  </h6>
                </div>
                <div style="display: flex; justify-content: start; margin-bottom: 10px;">
                  <p class="card-text "
                    data-price="${Number(
                      product.price - product.price * (product.discount / 100)
                    )}">Price:
                    <b>Rs:${Number(
                      product.price - product.price * (product.discount / 100)
                    ).toLocaleString()}
                    </b>
                  </p>
                </div>
                <div class="d-flex justify-content-between">
                  <p class="card-text text-success">
                    ${product.discount}% off
                  </p>
                  <p class="small text-danger"><s>Rs${product.price}</s></p>
                </div>
              </div>
          </a>

         ${stock}
        </div>`;

      productContainer.append(productCard);
    });
    products.forEach((product, i) => {
      const Offer = offer.filter(
        (offer) =>
          (offer.offerType === "Category" &&
            offer.offer === product.category) ||
          offer.offer === product.name
      );

      const [matchingOffer] = Offer;
      console.log(matchingOffer);

      if (matchingOffer) {
        const offerBadge = `
<span style="position: relative; z-index: 10px; border-radius: 20px; font-size: 13px; color: white; box-shadow: 1px 1px 10px rgb(77, 145, 240);" class="badge bg-primary float-right">
  <span>Special ${matchingOffer.percentage}% off</span>
</span>`;

        productContainer.find(`#offer-container-${i}`).append(offerBadge);
      }
    });
  }
});
