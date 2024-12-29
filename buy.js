const farmers = {};
const products = {};
const purchases = {};
const inventory = {};
const onSales = {};
const orders = {};
const logs = {};

const buyBadgetBtn = document.querySelector('#checkout-button');
const searchBtn = document.querySelector('#search-btn');


document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    renderProductCards();
    populateProductSelector();
    //localStorage.removeItem('logs');
    console.log(logs);
    /*
    console.log('FARMERS');
    console.log(farmers);

    console.log('PRODUCTS');
    console.log(products);

    console.log('PRUCHASES');
    console.log(purchases);

    console.log('İNVENTORY');
    console.log(inventory);
    
    console.log('SALES');
    console.log(onSales);
    */
    });

// Images for different weights
const productImages = {
    "0.1": "images/100gr.png", // Replace with real image links
    "0.25": "images/250gr.png",
    "0.5": "images/500gr.png",
    "1": "images/1kg.png",
    "2": "images/2kg.png",
    "5": "images/5kg.png"
};

function loadDataFromLocalStorage() {
    loadProductsFromLocalStorage();
    loadFarmersFromLocalStorage();
    loadPurchasesFromLocalStorage();
    loadInventoryFromLocalStorage();
    loadOnSalesFromLocalStorage();
    loadOrdersFromLocalStorage();
    loadLogsFromLocalStorage();
}
function saveDataToLocalStorage() {
    saveProductsToLocalStorage();
    saveFarmersToLocalStorage();
    savePurchasesToLocalStorage();
    saveInventoryToLocalStorage();
    saveOnSalesToLocalStorage();
    saveOrdersToLocalStorage();
    saveLogsToLocalStorage();
}
function returnCurrentDate() {
    const unformattedDate = new Date();

    // Yıl, ay, gün, saat ve dakika bilgilerini al
    const year = unformattedDate.getFullYear();
    const month = String(unformattedDate.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 arasında olduğu için +1 ekliyoruz
    const day = String(unformattedDate.getDate()).padStart(2, '0');
    const hours = String(unformattedDate.getHours()).padStart(2, '0');
    const minutes = String(unformattedDate.getMinutes()).padStart(2, '0');
    const seconds = String(unformattedDate.getSeconds()).padStart(2, '0'); // Saniye bilgisi

    const startDate = `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;

    return startDate;
}
function saveLogsToLocalStorage() {
    localStorage.setItem('logs', JSON.stringify(logs));
}
function loadLogsFromLocalStorage() {
    const storedLogs = localStorage.getItem('logs');
    if (storedLogs) {
        Object.assign(logs, JSON.parse(storedLogs));
    }
}
function saveInventoryToLocalStorage() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}
function loadInventoryFromLocalStorage() {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
        Object.assign(inventory, JSON.parse(storedInventory));
    }
}
function saveOnSalesToLocalStorage() {
    localStorage.setItem('onSales', JSON.stringify(onSales));
}
function loadOnSalesFromLocalStorage() {
    const storedOnSales = localStorage.getItem('onSales');
    if (storedOnSales) {
        Object.assign(onSales, JSON.parse(storedOnSales));
    }
}
function saveFarmersToLocalStorage() {
    localStorage.setItem('farmers', JSON.stringify(farmers));
}
function loadFarmersFromLocalStorage() {
    const storedFarmers = localStorage.getItem('farmers');
    if (storedFarmers) {
        Object.assign(farmers, JSON.parse(storedFarmers));
    }
}
function saveProductsToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}
function loadProductsFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        Object.assign(products, JSON.parse(storedProducts));
    }
}
function savePurchasesToLocalStorage() {
    localStorage.setItem('purchases', JSON.stringify(purchases));
}
function loadPurchasesFromLocalStorage() {
    const storedPurchases = localStorage.getItem('purchases');
    if (storedPurchases) {
        Object.assign(purchases, JSON.parse(storedPurchases));
    }
}
function saveOrdersToLocalStorage() {
    localStorage.setItem('orders', JSON.stringify(orders));
}
function loadOrdersFromLocalStorage() {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
        Object.assign(orders, JSON.parse(storedOrders));
    }
}

// Shopping cart data
const cart = [];

function renderProductCards() {
    const container = document.getElementById('product-cards-container');
    container.innerHTML = ''; // Clear container


    for (const productName in onSales) {
        const onSale = onSales[productName];
        const packages = onSale.packages;

        // Create a section for each product
        const productSection = document.createElement('div');
        productSection.classList.add('product-section');

        // Product Header (Product Name)
        const productHeader = document.createElement('h2');
        productHeader.textContent = productName;
        productHeader.classList.add('product-header');

        productSection.appendChild(productHeader);

        // Packages for the product
        const packageContainer = document.createElement('div');
        packageContainer.classList.add('package-container');

        // Convert packages to an array and sort by weight
        const sortedPackages = Object.values(packages).sort((a, b) => a.packageWeight - b.packageWeight);

        for (const package of sortedPackages) {            
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // Product Image
            const productImage = document.createElement('img');
            productImage.src = productImages[package.packageWeight] || 'images/5kg.png';
            productImage.alt = `${package.type} Image`;
            productImage.classList.add('product-image');

            // Product Details
            const productDetails = document.createElement('div');
            productDetails.classList.add('product-details');

            const productTitle = document.createElement('h3');
            const name = onSale.productName;
            const packageW = package.packageWeight;
            productTitle.textContent = `${packageW}Kg ${name}`;
            productTitle.classList.add('product-title');

            const productCount = document.createElement('p');
            const count = package.count;
            productCount.textContent = `Count: ${count}`;
            productCount.classList.add('product-count');

            const productPrice = document.createElement('p');
            const price = package.price;
            productPrice.textContent = `Price: $${price}`;
            productPrice.classList.add('product-price');

            // Buy Button
            const buyButton = document.createElement('button');
            buyButton.textContent = 'Add Basket';
            buyButton.classList.add('buy-button');

            // Input for count
            const countInput = document.createElement('input');
            countInput.type = 'number';
            countInput.min = 1; // Minimum value
            countInput.value = 1; // Default value
            countInput.classList.add('count-input');

            buyButton.addEventListener("click", () => {
                const availablePackage = package.count;
                const count = parseInt(countInput.value);
                if (count > 0 && count <= availablePackage) {
                    package.count -= count;
                    productCount.textContent = `Count: ${package.count}`;
                    countInput.value = 1; // Default value
                    
                    // Ürün sepette zaten var mı kontrol et
                    const existingItem = cart.find(
                        (item) =>
                            item.productName === productName &&
                            item.packageWeight === package.packageWeight
                    );
            
                    if (existingItem) {
                        // Ürün zaten varsa miktarını artır
                        existingItem.count += count;
                    } else {
                        // Ürün sepette yoksa yeni olarak ekle
                        cart.push({
                            productName: productName,
                            packageWeight: package.packageWeight,
                            price: package.price,
                            count: count,
                            type: package.type,
                        });
                    }
            
                    renderCart();
                } else if (count <= 0) {
                    alert("Birden küçük olamaz.");
                } else {
                    alert("Mağazada o kadar ürün bulunmamaktadır.");
                }
            });
            

            // Append elements to product details
            productDetails.appendChild(productTitle);
            productDetails.appendChild(productCount);
            productDetails.appendChild(productPrice);
            productDetails.appendChild(buyButton);
            productDetails.appendChild(countInput);

            // Append image and details to product card
            productCard.appendChild(productImage);
            productCard.appendChild(productDetails);

            // Add product card to package container
            packageContainer.appendChild(productCard);
        }

        // Append package container to product section
        productSection.appendChild(packageContainer);

        // Append product section to main container
        container.appendChild(productSection);
    }
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    cartItems.innerHTML = ""; // Clear cart

    let total = 0;
    cart.forEach((item, index) => {
        // Sepet öğesi için bir div oluştur
        const cartItem = document.createElement("div");
        cartItem.style.display = "flex";
        cartItem.style.justifyContent = "space-between";
        cartItem.style.alignItems = "center";
        cartItem.style.padding = "5px 0";

        // Ürün bilgisi
        const itemText = document.createElement("span");
        itemText.textContent = `${item.count} × ${item.packageWeight}Kg ${item.productName} - $${item.price * item.count}`;
        cartItem.appendChild(itemText);

        // Çıkarma (eksi) butonu
        const removeButton = document.createElement("button");
        removeButton.textContent = "−";
        removeButton.style.backgroundColor = "#dc3545";
        removeButton.style.color = "white";
        removeButton.style.border = "none";
        removeButton.style.borderRadius = "50%";
        removeButton.style.width = "24px";
        removeButton.style.height = "24px";
        removeButton.style.cursor = "pointer";
        removeButton.style.fontSize = "18px";
        removeButton.style.textAlign = "center";
        removeButton.style.lineHeight = "22px";
        removeButton.style.marginLeft = "10px";

        removeButton.addEventListener("click", () => {
            // Ürünü tamamen sepetten kaldır
            onSales[item.productName].packages[item.type].count += item.count; // Stoka geri ekle
            cart.splice(index, 1); // Sepetten tamamen kaldır
            renderProductCards();
            renderCart(); // Sepeti yeniden render et
        });

        cartItem.appendChild(removeButton);

        cartItems.appendChild(cartItem);
        total += item.price * item.count;
    });

    cartTotal.textContent = total;
}

buyBadgetBtn.addEventListener('click', () => {
    const unformattedDate = new Date();

    // Yıl, ay, gün, saat ve dakika bilgilerini al
    const year = unformattedDate.getFullYear();
    const month = String(unformattedDate.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 arasında olduğu için +1 ekliyoruz
    const day = String(unformattedDate.getDate()).padStart(2, '0');
    const hours = String(unformattedDate.getHours()).padStart(2, '0');
    const minutes = String(unformattedDate.getMinutes()).padStart(2, '0');

    // İstenilen formatta birleştir
    const date = `${year}-${month}-${day}_${hours}:${minutes}`;

    const orderId = `order_${Date.now()}`;

    if (cart && cart.length > 0) {
        const boughts = {};
        let i = 0;
        let w = 0;
        let p = 0;
        cart.forEach((item) => {
            boughts[i] = {
                productName: item.productName,
                count: item.count,
                price: item.price,
                packageWeight: item.packageWeight
            };
            i += Number(1);
            w += Number(item.count) * Number(item.packageWeight);
            p += Number(item.price) * Number(item.count);
        })
        orders[orderId] = {
            orderId: orderId,
            date: date,
            boughts,
            totalWeight: w,
            totalPrice: p
        }
        logs[returnCurrentDate()] = {
            type:'order',
            date: returnCurrentDate(),
            orderId
        }
        saveDataToLocalStorage();
        cart.length = 0; // Sepeti boşaltır
        renderProductCards();
        renderCart();  
    }else {
        alert('Sepet boş...');
    }
    
})

// Dropdown'u doldur
function populateProductSelector() {
    const selector = document.getElementById('product-selector');
    selector.innerHTML = '<option value="" disabled selected>Select a product</option>';

    for (const productName in onSales) {
        const option = document.createElement('option');
        option.value = productName; // Product ID'yi value olarak kullanıyoruz
        option.textContent = productName; // Ürün ismini gösteriyoruz
        selector.appendChild(option);
    }
}

const sellProductsContainer = document.getElementById('sell-products-container');

document.querySelector('#product-selector').addEventListener('change', () => {
    const val = document.querySelector('#product-selector').value; // Dropdown'dan seçilen ürün
    const productData = onSales[val]; // Seçilen ürünün bilgileri

    if (productData) {
        // Önceki tabloyu temizle
        sellProductsContainer.innerHTML = '';

        // Tabloyu oluştur
        const table = document.createElement('table');
        table.border = "1";
        table.style.width = "100%";
        table.style.marginTop = "20px";
        table.style.borderCollapse = "collapse";

        // Tablo başlıkları
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Package Type</th>
            <th>Package Weight (kg)</th>
            <th>Count</th>
            <th>Price</th>
        `;
        table.appendChild(headerRow);

        // Ürün paketlerini tabloya ekle
        const packages = productData.packages;
        for (const packageType in packages) {
            const packageData = packages[packageType];

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${packageData.type}</td>
                <td>${packageData.packageWeight + ' Kg'}</td>
                <td>${packageData.count}</td>
                <td>${packageData.price + ' $'}</td>
            `;
            table.appendChild(row);
        }

        // Tabloyu container'a ekle
        sellProductsContainer.appendChild(table);
    } else {
        sellProductsContainer.innerHTML = '<p>No product data available.</p>';
    }
});

