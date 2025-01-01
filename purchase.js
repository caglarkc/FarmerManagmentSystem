const isValidNumber = (str) => /^[0-9]+$/.test(str);

let isProductTableVisible = false;
const listProductsBtn = document.querySelector('#list-products-btn');
const searchProductBtn = document.querySelector('#search-product-btn');
const searchType = document.getElementById('search-type');
const searchValueFarmer = document.getElementById('search-value-farmer');
const listPurchasesBtn = document.querySelector('#list-purchases-btn');
const showFilterTableBtn = document.getElementById('show-results-btn');
const showFilterTableFarmerBtn = document.getElementById('show-results-farmer-btn');
const farmers = {};
const products = {};
const purchases = {};
const inventory = {};
const productNames = [];
const logs = {};
let isSearching = false;
let isBuySuccessfully = false;
let isPurchaseTableVisible = false;
let isFiltering = false;
let isFilteringFarmer = false;

document.addEventListener('DOMContentLoaded', () => {
    setInvisiblePurchaseTable();
    loadDataFromLocalStorage();
    addProductNames();
    addDropdownFarmersSecond();
    //localStorage.clear();
    //createData();
    console.log(logs);
    console.log(farmers);
    console.log(products);
    console.log(purchases);
    console.log(inventory);
});
searchValueFarmer.addEventListener('change', ()=> {
    setInvisibleFilteringFarmerTable();
    isFilteringFarmer = false;
})
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
    loadInventoryFromLocalStorage();
    loadLogsFromLocalStorage();
}
function saveDataToLocalStorage() {
    saveProductsToLocalStorage();
    saveFarmersToLocalStorage();
    savePurchasesToLocalStorage();
    saveInventoryToLocalStorage();
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
// Dropdown'u doldur
function addDropdownFarmersSecond() {
    const farmerDropdown = document.getElementById('search-value-farmer');
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
            if (inputValue == product.weight) {
                const farmer = farmers[product.farmerId];
                const index = farmer.productIds.indexOf(productId);
                farmer.productIds.splice(index, 1);
                delete products[productId];
            }else if(inputValue < product.weight) {
                product.weight = Number(product.weight) - Number (inputValue);
                product.totalPrice = Number(product.weight) * Number(product.price);
            }
            const weight = inputValue;
            const price = product.price;
            const totalPrice = Number(inputValue) * Number(price);
            const farmerId = product.farmerId;
            const productName = product.productName;
            purchases[purchaseId] = {
                purchaseId,
                productName,
                date,
                weight,
                price,
                totalPrice,
                farmerId
            }
            logs[returnCurrentDate()] = {
                type:'purchase_product',
                date: returnCurrentDate(),
                productName,
                weight,
                price,
                farmerId
            }
            let isExistProduct = false;
            for(const boughtProductId in inventory) {
                const boughtProduct = inventory[boughtProductId];
                if (product.productName == boughtProduct.productName) {
                    isExistProduct = true;
                    break;
                }
            }
            if (!isExistProduct) {
                const boughtProductId = `boughtProduct_${Date.now()}`;
                inventory[boughtProductId] = {
                    boughtProductId,
                    productName,
                    date: {},
                    location: 'local-storage',
                    weight
                }
                inventory[boughtProductId].date[date] = weight;
                
            }else {
                for(const boughtProductId in inventory) {
                    const boughtProduct = inventory[boughtProductId];
                    if (product.productName == boughtProduct.productName) {
                        boughtProduct.weight += Number(weight);
                        // Add or update the weight for the specific date
                        if (!boughtProduct.date[date]) {
                            boughtProduct.date[date] = weight;
                        } else {
                            // If the date already exists, add the new weight to the existing weight
                            boughtProduct.date[date] += weight;
                        }
                    }
                }
            }
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
    const productName = purchase.productName;
    const farmerName = farmers[purchase.farmerId].name;
    const date = purchase.date;
    const weight = purchase.weight;
    const price = purchase.price;
    const totalPrice = purchase.totalPrice;

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
        const isAscending = event.target.classList.contains('sorted-asc');
        document.querySelectorAll('.sortable').forEach(h => {
            h.classList.remove('sorted-asc', 'sorted-desc');
        });

        // Eğer zaten 'sorted-asc' varsa, 'sorted-desc' yap
        if (isAscending) {
            event.target.classList.add('sorted-desc');
            sortKeyWithWay(sortKey,'down');
            
        } else {
            event.target.classList.add('sorted-asc');
            sortKeyWithWay(sortKey,'up');
        }
    });
});

function sortKeyWithWay(sortKey,way) {
    if (sortKey == 'product-name') { 
        sortAndShowPurchases('product-name', way);
    } else if (sortKey == 'farmer-name') {
        sortAndShowPurchases('farmer-name', way); 
    } else if (sortKey == 'date') {
        sortAndShowPurchases('date', way); 
    }else if(sortKey == 'weight') {
        sortAndShowPurchases('weight', way); 
    }else if(sortKey == 'price') {
        sortAndShowPurchases('price', way); 
    }else if(sortKey == 'total-price') {
        sortAndShowPurchases('total-price', way); 
    }
    
}

function sortAndShowPurchases( sortKey , way) {
    let sortedPurchases;

    // Anahtar (key) türüne göre sıralama yap
    if (sortKey === 'product-name') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const nameA = a.productName.toLowerCase();
            const nameB = b.productName.toLowerCase();
            return way === 'up' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
    } else if (sortKey === 'farmer-name') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const nameA = farmers[a.farmerId].name.toLowerCase();
            const nameB = farmers[b.farmerId].name.toLowerCase();
            return way === 'up' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
    } else if (sortKey === 'date') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const dateA = new Date(a.date.replace('_', 'T'));
            const dateB = new Date(b.date.replace('_', 'T'));
            return way === 'up' ? dateA - dateB : dateB - dateA;
        });
    } else if (sortKey === 'weight') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const weightA = a.weight;
            const weightB = b.weight;
            return way === 'up' ? weightA - weightB : weightB - weightA;
        });
    } else if (sortKey === 'price') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const priceA = a.price;
            const priceB = b.price;
            return way === 'up' ? priceA - priceB : priceB - priceA;
        });
    } else if (sortKey === 'total-price') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const priceA = a.totalPrice;
            const priceB = b.totalPrice;
            return way === 'up' ? priceA - priceB : priceB - priceA;
        });
    }

    // Tabloyu temizle
    const tableBody = document.querySelector('#purchases-table-body');
    tableBody.innerHTML = '';

    // Sıralanmış listeyi tabloya ekle
    for (const purchase of sortedPurchases) {
        showPurchaseListOnTable(purchase);
    }
}

showFilterTableBtn.addEventListener('click', () => {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    const filteredBody = document.getElementById('filtered-purchases-body');

    if (isFiltering) {
        setInvisibleFilteringTable();
        isFiltering = false;
    }else {
        setVisibleFilteringTable();
        isFiltering = true;
        filteredBody.innerHTML = ''; // Önce tabloyu temizle

        for (const purchaseId in purchases) {
            const purchase = purchases[purchaseId];
            const purchaseDate = new Date(purchase.date.replace('_', 'T')); // Tarihi doğru formata dönüştür
    
            if (purchaseDate >= startDate && purchaseDate <= endDate) {
                // Satır ekleme
                const row = `
                    <tr>
                        <td>${purchase.productName}</td>
                        <td>${farmers[purchase.farmerId].name}</td>
                        <td>${purchase.date}</td>
                        <td>${purchase.weight}</td>
                        <td>${purchase.price}</td>
                        <td>${purchase.totalPrice}</td>
                    </tr>
                `;
                filteredBody.insertAdjacentHTML('beforeend', row);
            }
        }
    }
    
});

// Tabloyu görünür yapma fonksiyonu
function setVisibleFilteringTable() {
    const table = document.getElementById('filtered-purchases-table');
    table.style.display = 'table'; // Tabloyu görünür yapar
    showFilterTableBtn.textContent = 'Close Results';
}

// Tabloyu görünmez yapma fonksiyonu
function setInvisibleFilteringTable() {
    const table = document.getElementById('filtered-purchases-table');
    table.style.display = 'none'; // Tabloyu gizler
    showFilterTableBtn.textContent = 'Show Results';
}
function createData() {
    const farmerId1 = `farmer_${Date.now()}`;
    const farmerId2 = `farmer_${Date.now() + 1}`;
    const farmerId3 = `farmer_${Date.now() + 2}`;
    const productNames = [
        "Fresh Blueberries",
        "Frozen Blueberries",
        "Organic Blueberries",
        "Dried Blueberries",
        "Canned Blueberries",
        "Blueberry Powder",
        "Blueberry Jam",
        "Freeze-Dried Blueberries",
        "Blueberry Juice",
        "Wild Blueberries",
        "Blueberry Sorbet",
        "Candied Blueberries"
    ];

    let productIdCounter = 1; // Ürün ID'si için sayaç

    // Farmer bilgileri
    const farmerIds = [farmerId1, farmerId2, farmerId3];
    farmerIds.forEach((farmerId, farmerIndex) => {
        const farmerProducts = [];
        productNames.forEach((productName) => {
            const productId = `product_${productIdCounter++}`; // Her ürün için benzersiz ID
            const weight = Math.floor(Math.random() * 3000) + 500; // 500-3500 arasında rastgele ağırlık
            const price = Math.floor(Math.random() * 100) + 50; // 50-150 arasında rastgele fiyat

            // Ürün oluştur ve products nesnesine ekle
            products[productId] = {
                productId: productId,
                farmerId: farmerId,
                productName: productName,
                weight: weight,
                price: price,
                totalPrice: weight * price
            };

            farmerProducts.push(productId); // Farmer'ın ürün listesine ekle
        });

        // Farmer oluştur ve farmers nesnesine ekle
        farmers[farmerId] = {
            farmerId: farmerId,
            name: `Farmer ${farmerIndex + 1}`, // Çiftçi adı
            location: "İstanbul",
            email: `farmer${farmerIndex + 1}@example.com`,
            phone: `55555555${farmerIndex + 1}`,
            productIds: farmerProducts // Tüm ürün ID'lerini ekle
        };
    });


    saveDataToLocalStorage();
}


// Tabloyu görünür yapma fonksiyonu
function setVisibleFilteringFarmerTable() {
    const table = document.getElementById('filtered-purchases-farmer-table');
    table.style.display = 'table'; // Tabloyu görünür yapar
    showFilterTableFarmerBtn.textContent = 'Close Results';
}

// Tabloyu görünmez yapma fonksiyonu
function setInvisibleFilteringFarmerTable() {
    const table = document.getElementById('filtered-purchases-farmer-table');
    table.style.display = 'none'; // Tabloyu gizler
    showFilterTableFarmerBtn.textContent = 'Show Results';
}
showFilterTableFarmerBtn.addEventListener('click', () => {
    const farmerId = document.getElementById('search-value-farmer').value;
    const filteredBody = document.getElementById('filtered-purchases-farmer-body');

    if (isFilteringFarmer) {
        setInvisibleFilteringFarmerTable();
        isFilteringFarmer = false;
    }else {
        setVisibleFilteringFarmerTable();
        isFilteringFarmer = true;
        filteredBody.innerHTML = ''; // Önce tabloyu temizle

        for (const purchaseId in purchases) {
            const purchase = purchases[purchaseId];
            const purchaseDate = new Date(purchase.date.replace('_', 'T')); // Tarihi doğru formata dönüştür
    
            if (purchase.farmerId == farmerId) {
                // Satır ekleme
                const row = `
                    <tr>
                        <td>${purchase.productName}</td>
                        <td>${purchase.date}</td>
                        <td>${purchase.weight}</td>
                        <td>${purchase.price}</td>
                        <td>${purchase.totalPrice}</td>
                    </tr>
                `;
                filteredBody.insertAdjacentHTML('beforeend', row);
            }
        }
    }
}) 

