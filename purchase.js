const isValidNumber = (str) => /^[0-9]+$/.test(str);

let isProductTableVisible = false;
const listProductsBtn = document.querySelector('#list-products-btn');
const searchProductBtn = document.querySelector('#search-product-btn');
const searchType = document.getElementById('search-type');
const listPurchasesBtn = document.querySelector('#list-purchases-btn');
const showFilterTableBtn = document.getElementById('show-results-btn');
const farmers = {};
const products = {};
const purchases = {};
const inventory = {};
const productNames = [];
let isSearching = false;
let isBuySuccessfully = false;
let isPurchaseTableVisible = false;
let isFiltering = false;

document.addEventListener('DOMContentLoaded', () => {
    setInvisiblePurchaseTable();
    loadDataFromLocalStorage();
    addProductNames();
    //localStorage.clear();
    //createData();
    console.log(farmers);
    console.log(products);
    console.log(purchases);
    console.log(inventory);
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
    loadInventoryFromLocalStorage();
}
function saveDataToLocalStorage() {
    saveProductsToLocalStorage();
    saveFarmersToLocalStorage();
    savePurchasesToLocalStorage();
    saveInventoryToLocalStorage();
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
                    weight
                }
            }else {
                for(const boughtProductId in inventory) {
                    const boughtProduct = inventory[boughtProductId];
                    if (product.productName == boughtProduct.productName) {
                        boughtProduct.weight += Number(weight);
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
            const nameA = a.boughtProduct.productName.toLowerCase();
            const nameB = b.boughtProduct.productName.toLowerCase();
            return way === 'up' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
    } else if (sortKey === 'farmer-name') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const nameA = farmers[a.boughtProduct.farmerId].name.toLowerCase();
            const nameB = farmers[b.boughtProduct.farmerId].name.toLowerCase();
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
            const weightA = a.boughtProduct.weight;
            const weightB = b.boughtProduct.weight;
            return way === 'up' ? weightA - weightB : weightB - weightA;
        });
    } else if (sortKey === 'price') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const priceA = a.boughtProduct.price;
            const priceB = b.boughtProduct.price;
            return way === 'up' ? priceA - priceB : priceB - priceA;
        });
    } else if (sortKey === 'total-price') {
        sortedPurchases = Object.values(purchases).sort((a, b) => {
            const priceA = a.boughtProduct.totalPrice;
            const priceB = b.boughtProduct.totalPrice;
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
    const productId1 = `product_${Date.now() }`;
    const productId2 = `product_${Date.now() + 1}`;
    const productId3 = `product_${Date.now() + 2}`;
    const productId4 = `product_${Date.now() + 3}`;
    const productId5 = `product_${Date.now() + 4}`;
    farmers[farmerId1] = {
        farmerId: farmerId1,
        name: "Ali Çağlar Koçer",          // Farmer'ın adı
        location: "İstanbul",      // Konumu
        email: "alicaglarkocer@example.com", // E-posta adresi
        phone: "5521791303",        // Telefon numarası
        productIds: [productId1, productId2, productId3]
    };

    farmers[farmerId2] = {
        farmerId: farmerId2,
        name: "Buket Kaplaner",          // Farmer'ın adı
        location: "İstanbul",      // Konumu
        email: "buketkaplaner@example.com", // E-posta adresi
        phone: "5511050729",        // Telefon numarası
        productIds: [productId4]
    };

    farmers[farmerId3] = {
        farmerId: farmerId3,
        name: "Mehmet Koçer",          // Farmer'ın adı
        location: "İstanbul",      // Konumu
        email: "mehmetkocer@example.com", // E-posta adresi
        phone: "5307215273",        // Telefon numarası
        productIds: [productId5]
    };

    products[productId1] = {
        productId: productId1,
        farmerId: farmerId1,
        productName: "Blueberry",  
        weight: 2000,               
        price: 60,                 
        totalPrice: 2000 * 60       
    };

    products[productId2] = {
        productId: productId2,
        farmerId: farmerId1,
        productName: "Banana",  
        weight: 5000,               
        price: 400,                 
        totalPrice: 5000 * 40       
    };

    products[productId3] = {
        productId: productId3,
        farmerId: farmerId1,
        productName: "Apple",  
        weight: 1500,               
        price: 30,                 
        totalPrice: 1500 * 30       
    };

    products[productId4] = {
        productId: productId4,
        farmerId: farmerId2,
        productName: "Blueberry",  
        weight: 1000,               
        price: 40,                 
        totalPrice: 1000 * 40       
    };

    products[productId5] = {
        productId: productId5,
        farmerId: farmerId3,
        productName: "Blueberry",  
        weight: 3000,               
        price: 50,                 
        totalPrice: 3000 * 50       
    };

    saveDataToLocalStorage();
}