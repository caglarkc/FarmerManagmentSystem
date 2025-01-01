const farmers = {};
const products = {};
const purchases = {};
const inventory = {};
const onSales = {};
const orders = {};
const logs = {};

const buyBadgetBtn = document.querySelector('#checkout-button');
const searchBtn = document.querySelector('#search-btn');
const listOrdersBtn = document.querySelector('#list-orders-btn');

let isOrderTableVisible = false;



document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    renderProductCards();
    populateProductSelector();
    setInvisibleOrderTable();
    console.log(orders);
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

/*
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
*/


// Buy Badget Button Event Listener
buyBadgetBtn.addEventListener("click", function () {
    // Formu görünür yap
    if (cart.length > 0) {
        const formContainer = document.getElementById("userFormContainer");
        formContainer.style.display = "block";
    } else{
        alert("Sepet boş");
    }
});

// Cancel Button Event Listener
document.getElementById("cancelButton").addEventListener("click", function () {
    // Formu gizle
    const formContainer = document.getElementById("userFormContainer");
    formContainer.style.display = "none";
});

// Form Submit Event Listener
document.getElementById("userForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Formun varsayılan davranışını engelle

    // Kullanıcı bilgilerini al
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // Boş alan kontrolü
    if (!name || !address || !phone) {
        alert("Please fill out all fields.");
        return;
    }

    const customer = {
        name: name,
        address: address,
        phone: phone,
    };

    const unformattedDate = new Date();

    // Tarih formatlama
    const year = unformattedDate.getFullYear();
    const month = String(unformattedDate.getMonth() + 1).padStart(2, "0");
    const day = String(unformattedDate.getDate()).padStart(2, "0");
    const hours = String(unformattedDate.getHours()).padStart(2, "0");
    const minutes = String(unformattedDate.getMinutes()).padStart(2, "0");

    // İstenilen formatta birleştir
    const date = `${year}-${month}-${day}_${hours}:${minutes}`;

    const orderId = `order_${Date.now()}`; // Benzersiz bir sipariş ID oluştur

    if (cart && cart.length > 0) {
        const boughts = {};
        let i = 0;
        let totalWeight = 0;
        let totalPrice = 0;

        cart.forEach((item) => {
            boughts[i] = {
                productName: item.productName,
                count: item.count,
                price: item.price,
                packageWeight: item.packageWeight,
            };
            i += 1;
            totalWeight += Number(item.count) * Number(item.packageWeight);
            totalPrice += Number(item.price) * Number(item.count);
        });

        // Siparişi orders'a ekle
        orders[orderId] = {
            orderId: orderId,
            date: date,
            boughts,
            totalWeight,
            totalPrice,
            customer,
        };

        // Log kaydını ekle
        logs[returnCurrentDate()] = {
            type: "order",
            date: returnCurrentDate(),
            orderId,
        };

        // Veriyi LocalStorage'a kaydet
        saveDataToLocalStorage();

        // Sepeti temizle
        cart.length = 0;
        renderProductCards();
        renderCart();

        alert("Order placed successfully!");
    } else {
        alert("The cart is empty. Please add products to the cart.");
    }

    // Formu temizle ve gizle
    this.reset();
    document.getElementById("userFormContainer").style.display = "none";
});


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


listOrdersBtn.addEventListener('click', () => {
    if(isOrderTableVisible) {
        setInvisibleOrderTable();   
    }else {
        setVisibleOrderTable();
        for (const orderId in orders) {
            const order = orders[orderId];
            showOrderListOnTable(order);
        }
        listOrdersBtn.textContent = 'Close Table';
    }
})
function setInvisibleOrderTable() {
    document.getElementById('orders-table').style.display = 'none'
    listOrdersBtn.textContent = 'Show Orders';
    document.querySelector('#orders-table-body').innerHTML = ''; 
    isOrderTableVisible = false;
}
function setVisibleOrderTable() {
    document.getElementById('orders-table').style.display = 'table'
    isOrderTableVisible = true;
}
function showOrderListOnTable(order) {
    const tableBody = document.querySelector('#orders-table-body'); // Tablonun gövdesini seç
    const row = document.createElement('tr');

    const date = order.date;
    const orderId = order.orderId;
    const customerName = order.customer.name;
    const customerAddress = order.customer.address;
    const customerPhone = order.customer.phone;

    // Ürün detaylarını listelemek için
    const messages = [];
    for (const no in order.boughts) {
        const bought = order.boughts[no];
        const count = bought.count;
        const p = bought.price;
        const productName = bought.productName;
        const packageWeight = bought.packageWeight;
        const weight = Number(count) * Number(packageWeight);
        const price = Number(count) * Number(p);

        const message = `<li><strong>${productName}</strong> - ${packageWeight} kg'lık paketten ${count} adet (toplam: ${weight} kg) için toplam fiyat: ${price} ₺</li>`;
        messages.push(message);
    }

    // Ürün detaylarını liste formatında ekle
    const productDetails = `<ul style="list-style: none; padding: 0; margin: 0;">${messages.join('')}</ul>`;

    // Tablonun satırını oluştur
    row.innerHTML = `
        <td>${orderId}</td>
        <td>${customerName}</td>
        <td>${customerAddress}</td>
        <td>${customerPhone}</td>
        <td>${date}</td>
        <td>${productDetails}</td>
    `;

    // Satırı tabloya ekle
    tableBody.appendChild(row);
}


document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', (event) => {
        const sortKey = event.target.getAttribute('data-sort'); // Başlıktaki data-sort değerini alır
        const isAscending = event.target.classList.contains('sorted-asc');
        document.querySelectorAll('.sortable').forEach(h => {
            h.classList.remove('sorted-asc', 'sorted-desc');
        });

        // Eğer zaten 'sorted-asc' varsa, 'sorted-desc' yap
        if (isAscending) {
            event.target.classList.add('sorted-desc');
            sortOrders(sortKey, 'down');
        } else {
            event.target.classList.add('sorted-asc');
            sortOrders(sortKey, 'up');
        }
    });
});

function sortOrders(sortKey, way) {
    let sortedOrders;

    // Anahtar (key) türüne göre sıralama yap
    if (sortKey === 'order-id') {
        sortedOrders = Object.values(orders).sort((a, b) => {
            const idA = a.orderId.toLowerCase();
            const idB = b.orderId.toLowerCase();
            return way === 'up' ? idA.localeCompare(idB) : idB.localeCompare(idA);
        });
    } else if (sortKey === 'customer-name') {
        sortedOrders = Object.values(orders).sort((a, b) => {
            const nameA = a.customer.name.toLowerCase();
            const nameB = b.customer.name.toLowerCase();
            return way === 'up' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
    } else if (sortKey === 'customer-address') {
        sortedOrders = Object.values(orders).sort((a, b) => {
            const addressA = a.customer.address.toLowerCase();
            const addressB = b.customer.address.toLowerCase();
            return way === 'up' ? addressA.localeCompare(addressB) : addressB.localeCompare(addressA);
        });
    } else if (sortKey === 'customer-phone') {
        sortedOrders = Object.values(orders).sort((a, b) => {
            const phoneA = a.customer.phone.toLowerCase();
            const phoneB = b.customer.phone.toLowerCase();
            return way === 'up' ? phoneA.localeCompare(phoneB) : phoneB.localeCompare(phoneA);
        });
    } else if (sortKey === 'date') {
        sortedOrders = Object.values(orders).sort((a, b) => {
            const dateA = new Date(a.date.replace('_', 'T'));
            const dateB = new Date(b.date.replace('_', 'T'));
            return way === 'up' ? dateA - dateB : dateB - dateA;
        });
    } else if (sortKey === 'product') {
        sortedOrders = Object.values(orders).sort((a, b) => {
            const productA = Object.values(a.boughts)
                .map(b => b.productName.toLowerCase())
                .join(', ');
            const productB = Object.values(b.boughts)
                .map(b => b.productName.toLowerCase())
                .join(', ');
            return way === 'up' ? productA.localeCompare(productB) : productB.localeCompare(productA);
        });
    }

    // Tabloyu temizle
    const tableBody = document.querySelector('#orders-table-body');
    tableBody.innerHTML = '';

    // Sıralanmış listeyi tabloya ekle
    for (const order of sortedOrders) {
        showOrderListOnTable(order);
    }
}
