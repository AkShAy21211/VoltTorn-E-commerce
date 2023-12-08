function validateForm() {
    // Name validation

    var name = document.getElementById('name').value;
    var price = document.getElementById('price').value;
    var description = document.getElementById('description').value;
    var wordCount = description.trim().split(/\s+/).length;
    var category = document.getElementById('category').value;
    var sub_category = document.getElementById('subCategory').value;
    var brand = document.getElementById('brand').value;
    var discount = document.getElementById('discount').value;
    var status = document.getElementById('status').value;
    var stockQuantity = document.getElementById('stockQuantity').value;
    var checkboxes = document.querySelectorAll('input[name="colors[]"]');
    var images1 = document.getElementById('images1').value;
    var images2 = document.getElementById('images2').value;
    // Reset all warnings
    document.getElementById('nameWarning').innerText = '';
    document.getElementById('priceWarning').innerText = '';
    document.getElementById('descriptionWarning').innerText = '';
    document.getElementById('categoryWarning').innerText = '';
    document.getElementById('brandWarning').innerText = '';
    document.getElementById('discountWarning').innerText = '';
    document.getElementById('statusWarning').innerText = '';
    document.getElementById('stockWarning').innerText = '';
    document.getElementById('subCategoryWarning').innerText = '';
    document.getElementById('colorWarning').innerHTML = '';


    var atLeastOneChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

    // Validate all fields at once
    if (!name.trim()) {
        document.getElementById('nameWarning').innerText = 'Name cannot be empty.';
    }
    if (!price || isNaN(price)) {
        document.getElementById('priceWarning').innerText = 'Price should be a valid number.';
    }
    if (!description.trim() || wordCount < 10) {
        document.getElementById('descriptionWarning').innerText = 'Description should contain at least 10 words.';
    }
    if (!category) {
        document.getElementById('categoryWarning').innerText = 'Category cannot be empty.';
    }
    if (!sub_category) {
        document.getElementById('subCategoryWarning').innerText = 'Sub Category cannot be empty.';
    }
    if (!brand) {
        document.getElementById('brandWarning').innerText = 'Brand should be a valid value.';
    }
    // Check if discount is less than 0 or greater than 100
    if (discount < 0 || discount > 100) {
        document.getElementById('discountWarning').innerText = 'Discount must be between 0 and 100';
    } else if (!discount) {
        // If discount is not provided, set a default warning
        document.getElementById('discountWarning').innerText = 'Discount (Optional)';
    }

    if (!status) {
        document.getElementById('statusWarning').innerText = 'Status cannot be empty.';
    }
    if (!stockQuantity) {
        document.getElementById('stockWarning').innerText = 'StockQuantity cannot be empty.';
    } else if (stockQuantity < 0) {
        document.getElementById('stockWarning').innerText = 'StockQuantity must be greater than 0';
    }
    if (!atLeastOneChecked) {
        // Display a warning message
        document.getElementById('colorWarning').innerHTML = 'Please select at least one color';
      } 
      if (!images1.trim()) {
    document.getElementById('images1Warning').innerText = 'Please select at least one image.';
}

if (!images2.trim()) {
    document.getElementById('images2Warning').innerText = 'Please select at least one image.';
}

    // Check if any warning messages were set, return false if any field is invalid
    if (document.getElementById('nameWarning').innerText ||
        document.getElementById('priceWarning').innerText ||
        document.getElementById('descriptionWarning').innerText ||
        document.getElementById('categoryWarning').innerText ||
        document.getElementById('subCategoryWarning').innerText ||
        document.getElementById('brandWarning').innerText ||
        document.getElementById('discountWarning').innerText ||
        document.getElementById('statusWarning').innerText ||
        document.getElementById('stockWarning').innerText) {
        return false;
    }

    console.log('validateForm function called');
    // Form is valid
    return true;
}