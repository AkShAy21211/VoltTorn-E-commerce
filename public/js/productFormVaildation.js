
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


        var images = document.forms['ProductForm']['image1','image2','image3','image4']
        

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
        if (!discount) {
            document.getElementById('discountWarning').innerText = 'Discount (Optional)';
        }
        if (!status) {
            document.getElementById('statusWarning').innerText = 'Status cannot be empty.';
        }
        if (!stockQuantity) {
            document.getElementById('stockWarning').innerText = 'StockQuantity cannot be empty.';
        }
        if (Array.from(images).some(image => image.value !== '')) {
            document.getElementById('img1Warning').innerText = '';
        } else {
            document.getElementById('img1Warning').innerText = 'Images cannot be empty.';
        }
        


        // Check if any warning messages were set, return false if any field is invalid
        if (document.getElementById('nameWarning').innerText ||
            document.getElementById('priceWarning').innerText ||
            document.getElementById('descriptionWarning').innerText||
            document.getElementById('categoryWarning').innerText ||
            document.getElementById('subCategoryWarning').innerText||
            document.getElementById('brandWarning').innerText ||
            document.getElementById('discountWarning').innerText ||
            document.getElementById('statusWarning').innerText ||
            document.getElementById('stockWarning').innerText ||
            document.getElementById('img1Warning').innerText ) {
            return false;
        }
        console.log('validateForm function called');
        // Form is valid
        return true;
    }
