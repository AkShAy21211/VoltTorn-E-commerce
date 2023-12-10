const search_bar = document.getElementById('search-bar');

search_bar.addEventListener('input', (e) => {
    const inputValue = e.target.value;

    console.log(inputValue);
  
    const search  = axios.get(`/admin/search?query=${encodeURIComponent(inputValue)}`);
    

});
