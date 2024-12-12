const isValidNumber = (str) => /^[0-9]+$/.test(str);

let isProductTableVisible = false;
const listProductsBtn = document.querySelector('#list-products-btn');
const searchProductBtn = document.querySelector('#search-product-btn');
const farmers = {};
const products = {};

document.addEventListener('DOMContentLoaded', () => {
    loadFarmersFromLocalStorage();
    loadFroductsFromLocalStorage();
});



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
function loadFroductsFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        Object.assign(products, JSON.parse(storedProducts));
    }
}
function setInvisibleProductTable() {
    document.getElementById('products-table').style.display = 'none'
    listProductsBtn.textContent = 'Show Products';
    document.querySelector('#products-table-body').innerHTML = ''; 
    isProductTableVisible = false;
}
function setVisibleProductTable() {
    document.getElementById('products-table').style.display = 'table'
    isProductTableVisible = true;
}

listProductsBtn.addEventListener('click', () => {
    if(isProductTableVisible) {
        setInvisibleProductTable();   
    }else {
        setVisibleProductTable();
        const groupedProducts = {};
        // Her bir productı döndürmek için for...in kullanıyoruz
        for (const productId in products) {
            const product = products[productId];
            const name = product.productName;

            if (!groupedProducts[name]) {
                groupedProducts[name] = [];
            }

            groupedProducts[name].push(product);
        }
        compareGroupedProducts(groupedProducts);
        listProductsBtn.textContent = 'Close Table';
    }
});

function compareGroupedProducts(groupedProducts) {
    for (const groupName in groupedProducts) {
        const productGroup = groupedProducts[groupName];
        let productName = null;
        let totalW = 0;
        let tempAveragePrice = 0;
        let averagePrice = 0;
        let totalSeller = 0;
        let tempProduct = null;
        let minWeight = 0;
        let minPrice = 0;
        let minFarmerId = null;
        for(const product of productGroup) {
            productName = product.productName;
            totalSeller += 1;
            if (tempProduct == null) {
                tempProduct = product;
                totalW = Number(product.weight);
                tempAveragePrice = Number(product.price);
                minWeight = product.weight;
                minPrice = product.price;
                minFarmerId = product.farmerId;
            }else {
                totalW += Number(product.weight);
                tempAveragePrice += Number(product.price);
                if(minPrice > product.price) {
                    minPrice = product.price;
                    minWeight = product.weight;
                    minFarmerId = product.farmerId;
                }
            }
        }
        averagePrice = Number(tempAveragePrice / totalSeller);
        showProductOnTable(productName,totalW,averagePrice.toFixed(2),totalSeller,minPrice,minWeight,minFarmerId);
    }
}

function showProductOnTable(productName,totalW,averagePrice,totalSeller,minPrice,minWeight,minFarmerId) {
    const tableBody = document.querySelector('#products-table-body');
    const row = document.createElement('tr');
    const farmerName = farmers[minFarmerId].name;
    row.innerHTML = `
        <td>${productName}</td>
        <td>${totalW}</td>
        <td>${averagePrice}</td>
        <td>${totalSeller}</td>
        <td>${minPrice}</td>
        <td>${minWeight}</td>
        <td>${farmerName}</td>
    `;

    tableBody.appendChild(row);
};  

// Dropdown'u doldur
function addDropdownProducts() {
    const productDropdown = document.getElementById('search-value');
    productDropdown.innerHTML = '';
    // Farmers nesnesini döngü ile gez
    for (const productId in products) {
        const product = products[nesnesini];

        // Her çiftçi için bir <option> elementi oluştur
        const option = document.createElement('option');
        option.value = productId; // Değer olarak farmerId'yi kullan
        option.textContent = product.productName; // Gösterilecek metin olarak farmer.name kullan

        // Oluşturulan <option>'ı dropdown'a ekle
        productDropdown.appendChild(option);
    }
}

// Dropdown'u doldur
function addDropdownFarmers() {
    const farmerDropdown = document.getElementById('search-value');
    farmerDropdown.innerHTML = '';
    // Farmers nesnesini döngü ile gez
    for (const farmerId in farmers) {
        const farmer = farmers[farmerId];

        // Her çiftçi için bir <option> elementi oluştur
        const option = document.createElement('option');
        option.value = farmerId; // Değer olarak farmerId'yi kullan
        option.textContent = farmer.name; // Gösterilecek metin olarak farmer.name kullan

        // Oluşturulan <option>'ı dropdown'a ekle
        farmerDropdown.appendChild(option);
    }
}