
const listProductsBtn = document.querySelector('#list-products-btn');
const searchProductBtn = document.querySelector('#search-product-btn');
const farmers = {};
const products = {};
const purchases = {};
const inventory = {};
const productNames = [];
let isProductTableVisible = false;
let isSearching = false;
// Toplam paketlenen ağırlığı göstermek için
let totalPackagedWeight = 0;
const packagedData = {};


const packagingCategories = [
    { label: "Small", weight: 0.1 },   // 100g -> 0.1kg
    { label: "Medium", weight: 0.25 }, // 250g -> 0.25kg
    { label: "Large", weight: 0.5 },   // 500g -> 0.5kg
    { label: "Extra Large", weight: 1 }, // 1kg
    { label: "Family Pack", weight: 2 }, // 2kg
    { label: "Bulk Pack", weight: 5 }  // 5kg
];


document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    addDropdownProducts();
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
        
        for (const boughtProductId in inventory) {
            const boughtProduct = inventory[boughtProductId];
            const productName = boughtProduct.productName;

            if (!groupedProducts[productName]) {
                groupedProducts[productName] = [];
            }

            groupedProducts[productName].push(boughtProduct);
        }
        compareGroupedProducts(groupedProducts);
        listProductsBtn.textContent = 'Close Table';
    }
});

function compareGroupedProducts(groupedProducts) {
    for (const groupName in groupedProducts) {
        const productGroup = groupedProducts[groupName];
        let totalWeight = 0;
        let productName = null;
        let alert = "";
        let boughtProductId = null;
        for(const product of productGroup) {
            productName = product.productName;
            totalWeight += product.weight;
            boughtProductId = product.boughtProductId;
            if (product.alert != null) {
                alert = product.alert;
            }
        }
        showProductOnListTable(productName,totalWeight,alert,boughtProductId);
    }
}

function showProductOnListTable(productName,totalWeight,alert,boughtProductId) {
    const tableBody = document.querySelector('#products-table-body');
    const row = document.createElement('tr');

    let packageDetailsArray = [];
    const product = inventory[boughtProductId];
    let totalW = 0;
    
    // Paket bilgilerini al ve diziye ekle
    for (const type in product.packages) {
        const packageItem = product.packages[type];
        packageDetailsArray.push({
            type: packageItem.type,
            count: packageItem.count,
            weight: packageItem.weight
        });
        totalW += Number(packageItem.weight * packageItem.count);
    }

    // Ağırlıklarına (weight) göre küçükten büyüğe sırala
    packageDetailsArray.sort((a, b) => a.weight - b.weight);

    // Formatlanmış paket bilgilerini birleştir
    const packageDetailsFormatted = packageDetailsArray
        .map(pkg => `${pkg.weight}kg count: ${pkg.count}`)
        .join('<br>');
        

    row.innerHTML = `
        <td>${productName}</td>
        <td>${totalWeight + " Kg"}</td>
        <td>${totalW + " Kg"}</td>
        <td>${packageDetailsFormatted}</td>
        <td class="alert-cell">${alert}</td>
        <td>
            <button class="alert-btn" data-product-name="${productName}">
                Set / Change Alert
            </button>
        </td>
    `;

    

    // Tabloya ekle
    tableBody.appendChild(row);

    const alertBtn = row.querySelector('.alert-btn');
    alertBtn.addEventListener('click', () => {
        setAlertWeight(row,boughtProductId);
    });

}; 

function setAlertWeight(row,boughtProductId) {
    const alertCell = row.querySelector('.alert-cell'); // Alert hücresini seç
    const product = inventory[boughtProductId];
    let currentAlert = "";
    if (product.alert != null) {
        currentAlert = product.alert;
    }
    const alertBtn = row.querySelector('.alert-btn'); // Mevcut butonu seç
    const isEditing = alertBtn.textContent === 'Save'; // Butonun şu an "Save" olup olmadığını kontrol et

    if (isEditing) {
        // Kaydet Modu
        const input = alertCell.querySelector('.edit-alert');
        const newAlert = input.value;

        if (newAlert != "" && newAlert != currentAlert && Number(newAlert) > 0) {
            console.log(currentAlert);
            console.log(newAlert);
            // Yeni alert değerini kaydet ve hücreyi güncelle
            alertCell.textContent = newAlert;
            alertBtn.textContent = 'Set / Change Alert'; // Buton adını geri değiştir
            product.alert = newAlert;
            saveDataToLocalStorage();
        } else if(newAlert == currentAlert){
            alert('Alert value is the same with current value.');
        }else if(Number(newAlert) <= 0){
            alert('Alert value cannot be negative or zero.');
        }else if(newAlert == ""){
            alert('Alert value cannot be empty.');
        }
    } else {
        // Düzenleme Modu
        currentAlert = alertCell.textContent; // Mevcut alert değerini al
        alertCell.innerHTML = `
            <input type="number" class="edit-alert" value="${currentAlert}" style="width: 80px; padding: 4px;" />
        `;
        alertBtn.textContent = 'Save'; // Buton adını "Save" olarak değiştir
    }
}
// Dropdown'u doldur
function addDropdownProducts() {
    const productDropdown = document.getElementById('search-value');
    productDropdown.innerHTML = '';
    // Farmers nesnesini döngü ile gez
    for (const boughtProductId in inventory) {
        const boughtProduct = inventory[boughtProductId];
        if (!productNames.includes(boughtProduct.productName)) {
            productNames.push(boughtProduct.productName);

            const option = document.createElement('option');
            option.value = boughtProduct.boughtProductId; // Değer olarak farmerId'yi kullan
            option.textContent = boughtProduct.productName; // Gösterilecek metin olarak farmer.name kullan
    
            // Oluşturulan <option>'ı dropdown'a ekle
            productDropdown.appendChild(option);
        }
    }
}
// Event listener for Search Button
searchProductBtn.addEventListener('click', () => {
    const selectedProductId = document.getElementById('search-value').value;
    if (isSearching) {
        if (totalPackagedWeight != 0) {
            closeButton();
            document.getElementById('selected-product-container').innerHTML = "";
            isSearching = false;
            searchProductBtn.textContent = "Search";
            alert('Saved packages...');
            savePackages(   selectedProductId);
            Object.keys(packagedData).forEach(key => delete packagedData[key]);

        }else {
            alert("There isn't exist any package...");
        }
    }else {
        closeButton();
        isSearching = true;
        searchProductBtn.textContent = "Save";
        

        // Clear previous content
        let selectedProductContainer = document.getElementById('selected-product-container');
        if (!selectedProductContainer) {
            selectedProductContainer = document.createElement('div');
            selectedProductContainer.id = "selected-product-container";
            selectedProductContainer.style.marginTop = "1rem";
            document.querySelector('#packaging-products').appendChild(selectedProductContainer);
        }
        selectedProductContainer.innerHTML = "";
    
        // Inventory'deki toplam miktarı göster
        const inventoryWeight = inventory[selectedProductId].weight || 0;
    
        const inventoryInfo = document.createElement('div');
        inventoryInfo.textContent = `Available in Inventory: ${inventoryWeight} kg`;
        inventoryInfo.style.fontWeight = "bold";
        inventoryInfo.style.marginBottom = "1rem";
        selectedProductContainer.appendChild(inventoryInfo);
    
        // Dinamik toplam paketlenen ağırlığı göstermek için
        totalPackagedWeight = 0; // Sıfırla
        const totalWeightDisplay = document.createElement('div');
        totalWeightDisplay.textContent = "Total Packaged: 0 kg";
        totalWeightDisplay.style.marginTop = "1rem";
        totalWeightDisplay.style.fontWeight = "bold";
        selectedProductContainer.appendChild(totalWeightDisplay);
    
        // Create a table-like layout for packaging
        packagingCategories.forEach(category => {
            createPackagingRow(category, inventoryWeight, totalWeightDisplay);
        });
    }
    
});

// Function to create each packaging row
function createPackagingRow(category, maxInventory, totalWeightDisplay) {
    let count = 0; // Initial count for each packaging type

    // Row container
    const row = document.createElement('div');
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "1rem";
    row.style.marginBottom = "0.5rem";

    // Category Label
    const categoryLabel = document.createElement('span');
    categoryLabel.textContent = `${category.label} (${category.weight}kg)`;
    categoryLabel.style.width = "150px";

    // Minus Button
    const minusBtn = document.createElement('button');
    minusBtn.textContent = "-";
    styleButton(minusBtn);

    // Minus 10 Button
    const minusTenBtn = document.createElement('button');
    minusTenBtn.textContent = "-10";
    styleButton(minusTenBtn);

    // Count Display
    const countDisplay = document.createElement('span');
    countDisplay.textContent = count;
    countDisplay.style.fontSize = "1.1rem";
    countDisplay.style.fontWeight = "bold";
    countDisplay.style.minWidth = "20px";
    countDisplay.style.textAlign = "center";

    // Plus Button
    const plusBtn = document.createElement('button');
    plusBtn.textContent = "+";
    styleButton(plusBtn);

    // Plus 10 Button
    const plusTenBtn = document.createElement('button');
    plusTenBtn.textContent = "+10";
    styleButton(plusTenBtn);

    // Button Actions
    plusBtn.addEventListener('click', () => updateCount(1));
    minusBtn.addEventListener('click', () => updateCount(-1));
    plusTenBtn.addEventListener('click', () => updateCount(10));
    minusTenBtn.addEventListener('click', () => updateCount(-10));

    function updateCount(amount) {
        const addedWeight = category.weight * Math.abs(amount);
        if (amount > 0 && totalPackagedWeight + addedWeight > maxInventory) {
            alert("Not enough product in inventory!");
            return;
        }

        if (amount < 0 && count + amount < 0) {
            return; // Negatif değerlere izin verme
        }

        count += amount;
        totalPackagedWeight += amount * category.weight;
        countDisplay.textContent = count;
        totalWeightDisplay.textContent = `Total Packaged: ${totalPackagedWeight.toFixed(2)} kg`;

        // Paketleme verilerini kaydet
        packagedData[category.label] = {
            weight: category.weight,
            count: count,
            total: count * category.weight
        };
    }

    // Append elements to row
    row.appendChild(categoryLabel);
    row.appendChild(minusTenBtn);
    row.appendChild(minusBtn);
    row.appendChild(countDisplay);
    row.appendChild(plusBtn);
    row.appendChild(plusTenBtn);

    // Add row to the container
    const selectedProductContainer = document.getElementById('selected-product-container');
    selectedProductContainer.appendChild(row);
}

// Function to style buttons
function styleButton(button) {
    button.style.padding = "0.5rem";
    button.style.cursor = "pointer";
    button.style.width = "50px";
    button.style.textAlign = "center";
}

function closeButton() {
    const parentDiv = document.getElementById('search-product-btn').parentElement; // Search butonunun ebeveynini al
    
    // Eğer buton zaten varsa, eklemeyi durdur
    if (document.getElementById('close-button')) {
        const closeBtnElement = document.getElementById('close-button');
        if (closeBtnElement) {
            parentDiv.removeChild(closeBtnElement);
        }
    } else {
        // Yeni buton oluştur
        const closeBtnElement = document.createElement('button'); // Değişken adı değiştirildi
        closeBtnElement.id = 'close-button';
        closeBtnElement.textContent = 'Close';
        closeBtnElement.style.padding = '0.75rem 1.5rem';
        closeBtnElement.style.backgroundColor = '#f44336';
        closeBtnElement.style.color = 'white';
        closeBtnElement.style.border = 'none';
        closeBtnElement.style.borderRadius = '4px';
        closeBtnElement.style.cursor = 'pointer';
        closeBtnElement.style.transition = 'background-color 0.3s';

        // Hover efekti
        closeBtnElement.addEventListener('mouseover', () => {
            closeBtnElement.style.backgroundColor = '#d32f2f';
        });
        closeBtnElement.addEventListener('mouseout', () => {
            closeBtnElement.style.backgroundColor = '#f44336';
        });

        // Yeni butonu ekle
        parentDiv.appendChild(closeBtnElement);

        // Butona tıklandığında işlemleri gerçekleştir
        closeBtnElement.addEventListener('click', () => {
            document.getElementById('selected-product-container').innerHTML = "";
            isSearching = false;
            searchProductBtn.textContent = "Search";
            parentDiv.removeChild(closeBtnElement); // Butonu kaldır
        });
    }
}
function savePackages(selectedProductId) {
    const product = inventory[selectedProductId];
    let used = 0;

    if (!product.packages) {
        product.packages = {}; // Eğer tanımlı değilse boş bir obje olarak başlat
    }

    for (const typeLabel in packagedData) {
        if (packagedData[typeLabel].count > 0) { // Sadece paketlenenleri al
            const count = packagedData[typeLabel].count; // Paketlenen adet
            const total = packagedData[typeLabel].total; // Toplam ağırlık
            const weight = packagedData[typeLabel].weight;
            
            if (product.packages[typeLabel]) {
                // Eğer typeLabel zaten varsa, mevcut count değerini artır
                product.packages[typeLabel].count += count;
            } else {
                // Eğer typeLabel yoksa, yeni bir giriş oluştur
                product.packages[typeLabel] = {
                    type: typeLabel,
                    count,
                    weight
                };
            }

            used += total; // Kullanılan toplam ağırlığı hesapla
        }
    }

    product.packagedWeight = used;
    product.weight -= Number(used); // Stoktan kullanılan ağırlığı düş
    saveDataToLocalStorage(); // Veriyi LocalStorage'a kaydet
    setInvisibleProductTable();
}