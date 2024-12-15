const isValidNumber = (str) => /^[0-9]+$/.test(str);

let isProductTableVisible = false;
const listProductsBtn = document.querySelector('#list-products-btn');
const searchProductBtn = document.querySelector('#search-product-btn');
const searchType = document.getElementById('search-type');
const listPurchasesBtn = document.querySelector('#list-purchases-btn');
const farmers = {};
const products = {};
const purchases = {};
const productNames = [];
let isSearching = false;
let isBuySuccessfully = false;
let isPurchaseTableVisible = false;

document.addEventListener('DOMContentLoaded', () => {
    setInvisiblePurchaseTable();
    loadDataFromLocalStorage();
    addProductNames();
    console.log(purchases);
});
// Farmer Name Dropdown'da değişiklik olduğunda çalışacak
searchType.addEventListener('change', function() {
    const selectedType = this.value;
    if (selectedType == 'farmer-name') {
        addDropdownFarmers();
    }else if (selectedType == 'product-name'){
        addDropdownProducts();
    }
});
function loadDataFromLocalStorage() {
    loadProductsFromLocalStorage();
    loadFarmersFromLocalStorage();
    loadPurchasesFromLocalStorage();
}
function saveDataToLocalStorage() {
    saveProductsToLocalStorage();
    saveFarmersToLocalStorage();
    savePurchasesToLocalStorage();
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
function addProductNames() {
    for (const productId in products) {
        const product = products[productId];
        if (!productNames.includes(product.productName)) {
            productNames.push(product.productName);
        }
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
        showProductOnListTable(productName,totalW,averagePrice.toFixed(2),totalSeller,minPrice,minWeight,minFarmerId);
    }
}
function showProductOnListTable(productName,totalW,averagePrice,totalSeller,minPrice,minWeight,minFarmerId) {
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
    for (const productName of productNames) {
        // Her çiftçi için bir <option> elementi oluştur
        const option = document.createElement('option');
        option.value = productName; // Değer olarak farmerId'yi kullan
        option.textContent = productName; // Gösterilecek metin olarak farmer.name kullan

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
searchProductBtn.addEventListener('click' , () => {
    isSearching = false;
    isChecked = false;
    clearSearchTable();
    hideSearchResults();
    const searchVal = document.getElementById('search-value').value;
    const selectedType = searchType.value; 
    if (selectedType == 'farmer-name') {
        if(farmers[searchVal] != null) {
            const farmer = farmers[searchVal];
            for (const productId of farmer.productIds) {
                const product = products[productId];

                showProductOnSearchTable(product);
            }
        }
    }else if (selectedType == 'product-name'){
        for (const productId in products) {
            const product = products[productId];
            if (product.productName == searchVal) {
                showProductOnSearchTable(product);
            }

            
        }
    }
} )
function showProductOnSearchTable(product) {
    isSearching = true;
    showSearchResults();
    const name = product.productName;
    const weight = product.weight;
    const price = product.price;
    const totalPrice = product.totalPrice;
    const farmerName = farmers[product.farmerId].name;

    const tableBody = document.getElementById('search-results-body');

    // Yeni bir satır oluştur
    const row = document.createElement('tr');

    // Satırın içeriğini doldur
    row.innerHTML = `
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${name}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${weight}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${price}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${totalPrice}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${farmerName}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">
        <input type="number"
               id="input-${product.productId}" 
               min="0" 
               step="0.1" 
               placeholder="0" 
               style="width: 80%; padding: 0.5rem; text-align: center; border: 1px solid #ccc; border-radius: 4px;">
        </td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">
            <button 
                class="product-button" 
                data-product-id="${product.productId}" 
                style="padding: 0.5rem 1rem; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Purchase
            </button>
        </td>
    `;

    // Satırı tabloya ekle
    tableBody.appendChild(row);

    const button = row.querySelector('.product-button');
    button.addEventListener('click', () => {
        const productId = event.target.dataset.productId;
        const inputValue = Number(document.getElementById(`input-${productId}`).value);
        const product = products[productId];
        const purchaseId = `purchase_${Date.now()}`;
        const unformattedDate = new Date();

        // Yıl, ay, gün, saat ve dakika bilgilerini al
        const year = unformattedDate.getFullYear();
        const month = String(unformattedDate.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 arasında olduğu için +1 ekliyoruz
        const day = String(unformattedDate.getDate()).padStart(2, '0');
        const hours = String(unformattedDate.getHours()).padStart(2, '0');
        const minutes = String(unformattedDate.getMinutes()).padStart(2, '0');

        // İstenilen formatta birleştir
        const date = `${year}-${month}-${day}_${hours}:${minutes}`;
        if (inputValue <= product.weight && inputValue > 0) {
            isBuySuccessfully = true;
            const boughtProduct = JSON.parse(JSON.stringify(product));
            if (inputValue == product.weight) {
                const farmer = farmers[product.farmerId];
                const index = farmer.productIds.indexOf(productId);
                farmer.productIds.splice(index, 1);
                delete products[productId];

            }else if (inputValue < product.weight){
                product.weight = Number(product.weight) - Number (inputValue);
                product.totalPrice = Number(product.weight) * Number(product.price);
                
            }
            delete boughtProduct.productId;
            boughtProduct.weight = inputValue;
            boughtProduct.totalPrice = Number(inputValue) * Number(boughtProduct.price);
            purchases[purchaseId] = {
                purchaseId,
                boughtProduct,
                date
            };
            saveDataToLocalStorage();
            alert(`Başarı ile "${inputValue}"kg kadar "${product.productName}", "${totalPrice}"Tl ye alındı...`);
            setInvisiblePurchaseTable();
            setInvisibleProductTable();
            hideSearchResults();
            clearSearchTable();
        }else {
            isBuySuccessfully = false;
            alert(`Maximum "${product.weight}"kg kadar alınabilir...`);
        }
    })
}
function showSearchResults() {
    document.getElementById('search-results-table').style.display = 'table'; // Tabloyu görünür yapar
}
function hideSearchResults() {
    document.getElementById('search-results-table').style.display = 'none'; // Tabloyu gizler
}
function clearSearchTable() {
    const tableBody = document.getElementById('search-results-body');
    tableBody.innerHTML = ''; // Tablo gövdesindeki tüm içerikleri temizler
}
listPurchasesBtn.addEventListener('click', () => {
    if(isPurchaseTableVisible) {
        setInvisiblePurchaseTable();   
    }else {
        setVisiblePurchaseTable();
        for (const purchaseId in purchases) {
            const purchase = purchases[purchaseId];
            showPurchaseListOnTable(purchase);
        }
        listPurchasesBtn.textContent = 'Close Table';
    }
})
function setInvisiblePurchaseTable() {
    document.getElementById('purchases-table').style.display = 'none'
    listPurchasesBtn.textContent = 'Show Purchases';
    document.querySelector('#purchases-table-body').innerHTML = ''; 
    isPurchaseTableVisible = false;
}
function setVisiblePurchaseTable() {
    document.getElementById('purchases-table').style.display = 'table'
    isPurchaseTableVisible = true;
}
function showPurchaseListOnTable(purchase) {
    const tableBody = document.querySelector('#purchases-table-body');
    const row = document.createElement('tr');
    const boughtProduct = purchase.boughtProduct;
    const productName = boughtProduct.productName;
    const farmerName = farmers[boughtProduct.farmerId].name;
    const date = purchase.date;
    const weight = boughtProduct.weight;
    const price = boughtProduct.price;
    const totalPrice = boughtProduct.totalPrice;

    row.innerHTML = `
        <td>${productName}</td>
        <td>${farmerName}</td>
        <td>${date}</td>
        <td>${weight}</td>
        <td>${price}</td>
        <td>${totalPrice}</td>
        
    `;

    tableBody.appendChild(row);

    
}
document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', (event) => {
        const sortKey = event.target.getAttribute('data-sort'); // Başlıktaki data-sort değerini alır
        console.log(`Header clicked for sorting by: ${sortKey}`);
        const isAscending = event.target.classList.contains('sorted-asc');
        document.querySelectorAll('.sortable').forEach(h => {
            h.classList.remove('sorted-asc', 'sorted-desc');
        });

        // Eğer zaten 'sorted-asc' varsa, 'sorted-desc' yap
        if (isAscending) {
            console.log(sortKey);
            event.target.classList.add('sorted-desc');
            sortKeyWithWay(sortKey,'down');
            
        } else {
            event.target.classList.add('sorted-asc');
            sortKeyWithWay(sortKey,'up');
        }
    });
});

function sortKeyWithWay(sortKey,way) {
    if(sortKey == 'product-name') {
        if(way == 'up') {
            const productNames = new Set();
            for(const purchaseId in purchases) {
                const purchase = purchases[purchaseId];
                const productName = purchase.boughtProduct.productName;
                productNames.add(productName);
            }
            const sortedProductNames = Array.from(productNames).sort();
            console.log(sortedProductNames);
        }else {
            const productNames = new Set();
            for(const purchaseId in purchases) {
                const purchase = purchases[purchaseId];
                const productName = purchase.boughtProduct.productName;
                productNames.add(productName);
            }
            const sortedProductNames = Array.from(productNames).sort((a, b) => {
                return b.localeCompare(a); // Alfabetik sıralamanın tersini yapar
            });
            console.log(sortedProductNames);
        }
    }else if(sortKey == 'farmer-name') {
        if(way == 'up') {
            const farmerNames = new Set();
            for(const purchaseId in purchases) {
                const purchase = purchases[purchaseId];
                const farmerName = farmers[purchase.boughtProduct.farmerId].name;
                farmerNames.add(farmerName);
            }
            const sortedFarmerNames = Array.from(farmerNames).sort();
            console.log(sortedFarmerNames);
        }else {
            const farmerNames = new Set();
            for(const purchaseId in purchases) {
                const purchase = purchases[purchaseId];
                const farmerName = farmers[purchase.boughtProduct.farmerId].name;
                farmerNames.add(farmerName);
            }
            const sortedFarmerNames = Array.from(farmerNames).sort((a, b) => {
                return b.localeCompare(a); // Alfabetik sıralamanın tersini yapar
            });
            console.log(sortedFarmerNames);
        }
    }else if(sortKey == 'date') {
        if (way == 'up') {
            const dates = [];
            for (const purchaseId in purchases) {
                const purchase = purchases[purchaseId];
                const date = purchase.date; // Date formatı: "2024-12-15_11:57"
                dates.push(date);
            }
            const sortedDates = dates.sort((a, b) => new Date(a.replace('_', 'T')) - new Date(b.replace('_', 'T')));
            console.log(sortedDates);
        } else {
            const dates = [];
            for (const purchaseId in purchases) {
                const purchase = purchases[purchaseId];
                const date = purchase.date; // Date formatı: "2024-12-15_11:57"
                dates.push(date);
            }
            const sortedDates = dates.sort((a, b) => new Date(b.replace('_', 'T')) - new Date(a.replace('_', 'T')));
            console.log(sortedDates);
        }
    }else if(sortKey == 'weight') {
        
    }else if(sortKey == 'price') {
        
    }else if(sortKey == 'total-price') {
        
    }
    
}