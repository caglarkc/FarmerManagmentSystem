const saveSellBtn = document.querySelector('#save-sell-btn');


const farmers = {};
const products = {};
const purchases = {};
const inventory = {};


document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    populateProductSelector();
    console.log(farmers);
    console.log(products);
    console.log(purchases);
    console.log(inventory);
    
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

// Dropdown'dan seçim yapıldığında çağırılacak
document.getElementById('product-selector').addEventListener('change', (e) => {
    const selectedProductId = e.target.value;
    getSalesByProduct(selectedProductId);
});

// Sayfa yüklendiğinde selector'u doldur
document.addEventListener('DOMContentLoaded', () => {
    populateProductSelector();
});

// Seçilen ürüne göre satış listesini oluştur
function getSalesByProduct(productId) {
    const container = document.getElementById('sell-products-container');
    container.innerHTML = ''; // Önce içeriği temizle

    const product = inventory[productId];
    if (!product || !product.packages) return;

    // Ürün başlığı
    const productHeader = document.createElement('h3');
    productHeader.textContent = `Product: ${product.productName}`;
    productHeader.classList.add('product-header');
    container.appendChild(productHeader);

    // Paketleri ağırlıklarına göre sıralamak için diziye dönüştür
    const sortedPackages = Object.values(product.packages).sort((a, b) => a.weight - b.weight);

    // Sıralı paketleri göster
    sortedPackages.forEach(packageItem => {
        const row = document.createElement('div');
        row.classList.add('sell-product-row');

        // Paket adı
        const packageLabel = document.createElement('span');
        packageLabel.textContent = `${packageItem.type} (${packageItem.weight}kg)`;
        packageLabel.classList.add('package-label');

        packageLabel.dataset.type = packageItem.type; 

        // Paket sayısı
        const packageCount = document.createElement('span');
        packageCount.textContent = `Count: ${packageItem.count}`;
        packageCount.classList.add('package-count');

        // Satıştaki paket sayısı
        const soldCount = document.createElement('span');
        soldCount.textContent = `On Sold: ${packageItem.soldCount || 0}`;
        soldCount.classList.add('sold-count');

        // Adet girişi
        const inputField = document.createElement('input');
        inputField.type = 'number';
        inputField.min = '0';
        inputField.placeholder = 'Enter count';
        inputField.classList.add('count-input');
        inputField.dataset.packageType = packageItem.type;

        // Checkbox (Tick)
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('select-checkbox');
        checkbox.dataset.packageType = packageItem.type;

        // Satır elemanlarını birleştir
        row.appendChild(packageLabel);
        row.appendChild(packageCount);
        row.appendChild(soldCount);
        row.appendChild(inputField);
        row.appendChild(checkbox);
        container.appendChild(row);
    });
}

// Dropdown'u doldur
function populateProductSelector() {
    const selector = document.getElementById('product-selector');
    selector.innerHTML = '<option value="" disabled selected>Select a product</option>';

    for (const productId in inventory) {
        const product = inventory[productId];
        if (product.packagedWeight != null) {
            const option = document.createElement('option');
            option.value = productId; // Product ID'yi value olarak kullanıyoruz
            option.textContent = product.productName; // Ürün ismini gösteriyoruz
            selector.appendChild(option);
        }
    }
}
//AŞAGIDAKİ KISIMDA VERİLERİ ALMA VE HATALARI DUZGUN KONTROL ETMESİ KALMIŞTI ONARLI DUZELT VE SONRADNA LONTROL ET
saveSellBtn.addEventListener('click', () => {
    const selectedProductId = document.getElementById('product-selector').value;
    const product = inventory[selectedProductId];
    if (!selectedProductId) {
        alert('Please choose a product...');
        return;
    }

    // Seçili ürünün tüm satırlarını al
    const rows = document.querySelectorAll('.sell-product-row');
    const data = []; // Toplanan verileri tutacak dizi

    rows.forEach(row => {
        const checkbox = row.querySelector('.select-checkbox'); // Checkbox
        const countInput = row.querySelector('.count-input'); // Sayı inputu
        const packageLabel = row.querySelector('.package-label'); // Paket adı (etiket)

        if (checkbox.checked) { // Checkbox seçiliyse
            const countValue = parseInt(countInput.value, 10) || 0;

            console.log(packageLabel.dataset.type);
            if (countValue > 0) {
                data.push({
                    packageType: packageLabel.textContent.trim(), // Paket adı
                    count: countValue // Girilen değer
                });
            } else {
                alert(`Please enter a valid count for ${packageLabel.textContent.trim()}`);
                return;
            }
        }
    });

    if (data.length === 0) {
        alert('No packages selected or valid count entered.');
        return;
    }

    console.log('Selected Packages:', data);
})