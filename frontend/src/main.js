import './style.css';
// Wait until the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const productsGrid = document.getElementById("products");
  const customAlert = document.getElementById("alert");
// Function to show temporary alert messages
  function showAlert(message) {
    customAlert.textContent = message;
    customAlert.classList.remove("hide");
    setTimeout(() => {
      customAlert.classList.add("hide");
    }, 3000);
  }
// Add event listener for the form submission
  form.addEventListener("submit", async (e) => {
    // Prevent the page from refreshing when the form is submitted
    e.preventDefault();
    // Get the value typed in the search bar
    const keyword = document.getElementById("search-bar").value.trim();
    // If no keyword was entered, show an alert and stop execution
    if (!keyword) {
      showAlert("Type a product to search!");
      return;
    }

    customAlert.classList.add("hide");
    productsGrid.innerHTML = "<p>Loading...</p>";

    try {
      // Send a request to your backend API with the keyword
      const response = await fetch(`/api/scrape?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      // Parse the JSON response and extract the products
      const { products } = await response.json();
      productsGrid.innerHTML = "";
      // If no products are found, show a message
      if (!products || products.length === 0) {
        productsGrid.innerHTML = "<p>Products not found.</p>";
        return;
      }
      // Loop through each product and create a grid element
      products.forEach((product) => {
        const grid = document.createElement("div");
        grid.className = "product-grid";
        grid.innerHTML = `
          <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p>${product.rating}⭐  - ${product.reviews} reviews</p>
        `;
        // Add the product card into the products container
        productsGrid.appendChild(grid);
      });
    } catch (error) {
      // If an error occurs, log it and show an alert
      console.error("Failed to search products:", error);
      showAlert("Failed to load products. Try again.");
      productsGrid.innerHTML = "";
    }
  });
});
