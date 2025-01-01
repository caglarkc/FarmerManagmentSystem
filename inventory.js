
const listProductsBtn = document.querySelector('#list-products-btn');
const searchProductBtn = document.querySelector('#search-product-btn');
const specialSearchProductBtn = document.querySelector('#special-search-product-btn');
const searchEditPackageBtn = document.querySelector('#search-edit-package');

const farmers = {};
const products = {};
const purchases = {};
const inventory = {};
const onSales = {};
const logs = {};
const productNames = [];
let isProductTableVisible = false;
let isSearching = false;
let specialIsSearching = false;
let isEditing = false;
// Toplam paketlenen ağırlığı göstermek için
let totalPackagedWeight = 0;
const packagedData = {};
const specialPackagedData = {};


const packagingCategories = [
    { label: "Small", weight: 0.1 },   // 100g -> 0.1kg
    { label: "Medium", weight: 0.25 }, // 250g -> 0.25kg
    { label: "Large", weight: 0.5 },   // 500g -> 0.5kg
    { label: "Extra Large", weight: 1 }, // 1kg
    { label: "Family Pack", weight: 2 }, // 2kg
    { label: "Bulk Pack", weight: 5 },  // 5kg
];


document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    addDropdownProducts();
    
});

function loadDataFromLocalStorage() {
    loadProductsFromLocalStorage();
    loadFarmersFromLocalStorage();
    loadPurchasesFromLocalStorage();
    loadInventoryFromLocalStorage();
    loadOnSalesFromLocalStorage();
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
function loadOnSalesFromLocalStorage() {
    const storedOnSales = localStorage.getItem('onSales');
    if (storedOnSales) {
        Object.assign(onSales, JSON.parse(storedOnSales));
    }
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
    
    //Satıştaki ürünlerin kilolarını alma
    const onSale = onSales[productName];
    let onSaleWeight = 0;
    if (onSale != null) {
        const packages = onSale.packages;
        for (const type in packages) {
            const package = packages[type];
            onSaleWeight += Number(package.packageWeight) * Number(package.count);
        }
    }

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
        .map(pkg => `${pkg.weight}kg * ${pkg.count}`)
        .join('<br>');
        

    row.innerHTML = `
        <td>${productName}</td>
        <td>${onSaleWeight + " Kg"}</td>
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
            logs[returnCurrentDate()] = {
                type:'set_alert',
                date: returnCurrentDate(),
                boughtProductId,
                alert: newAlert
            }
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

    const specialProductDropdown = document.getElementById('special-search-value');
    specialProductDropdown.innerHTML = '';

    const inventoryDropdown = document.getElementById('edit-package-value');
    inventoryDropdown.innerHTML = '';

    // Farmers nesnesini döngü ile gez
    for (const boughtProductId in inventory) {
        const boughtProduct = inventory[boughtProductId];
        if (!productNames.includes(boughtProduct.productName)) {
            productNames.push(boughtProduct.productName);

            const option = document.createElement('option');
            option.value = boughtProduct.boughtProductId; // Değer olarak productId'yi kullan
            option.textContent = boughtProduct.productName; // Gösterilecek metin olarak farmer.name kullan
    
            const option2 = document.createElement('option');
            option2.value = boughtProduct.boughtProductId; // Değer olarak productId'yi kullan
            option2.textContent = boughtProduct.productName; // Gösterilecek metin olarak farmer.name kullan

            const option3 = document.createElement('option');
            option3.value = boughtProduct.boughtProductId; // Değer olarak productId'yi kullan
            option3.textContent = boughtProduct.productName; // Gösterilecek metin olarak farmer.name kullan
            // Oluşturulan <option>'ı dropdown'a ekle
            productDropdown.appendChild(option);
            specialProductDropdown.appendChild(option2);
            inventoryDropdown.appendChild(option3);
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
            savePackages(selectedProductId, false);
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
function closeButton() {
    const parentDiv = document.getElementById('search-product-btn').parentElement;

    // Buton zaten varsa ve ebeveyni içinde bulunuyorsa kaldır
    const closeBtnElement = document.getElementById('close-button');
    if (closeBtnElement && parentDiv.contains(closeBtnElement)) {
        parentDiv.removeChild(closeBtnElement);
    } else {
        // Yeni buton oluştur
        const closeBtnElement = document.createElement('button');
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
            const selectedContainer = document.getElementById('selected-product-container');
            if (selectedContainer) {
                selectedContainer.innerHTML = "";
            }
            isSearching = false;
            searchProductBtn.textContent = "Search";
            parentDiv.removeChild(closeBtnElement); // Butonu kaldır
        });
    }
}

specialSearchProductBtn.addEventListener('click', () => {
    let isSetedKg = false;
    const selectedProductId = document.getElementById('special-search-value').value;
    if (specialIsSearching) {
        if (totalPackagedWeight != 0) {
            specialCloseButton();
            document.getElementById('special-selected-product-container').innerHTML = "";
            specialIsSearching = false;
            specialSearchProductBtn.textContent = "Search";
            alert('Saved packages...');
            savePackages(selectedProductId,true);
            Object.keys(specialPackagedData).forEach(key => delete specialPackagedData[key]);

        } else {
            alert("There isn't exist any package...");
        }
    } else {
        specialCloseButton();
        specialIsSearching = true;
        specialSearchProductBtn.textContent = "Save";

        // Clear previous content
        let selectedProductContainer = document.getElementById('special-selected-product-container');
        if (!selectedProductContainer) {
            selectedProductContainer = document.createElement('div');
            selectedProductContainer.id = "special-selected-product-container";
            selectedProductContainer.style.marginTop = "1rem";
            document.querySelector('#special-packaging-products').appendChild(selectedProductContainer);
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

        let count = 0;

        // Row container
        const row = document.createElement('div');
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.gap = "1rem";
        row.style.marginBottom = "0.5rem";

        // Category Label
        const categoryLabel = document.createElement('span');
        categoryLabel.textContent = "Custom Package";
        categoryLabel.style.width = "150px";

        let specialWeight = 0;

        // Input for custom weight
        const customWeightInput = document.createElement('input');
        customWeightInput.type = "number";
        customWeightInput.min = "0.01";
        customWeightInput.step = "0.01";
        customWeightInput.placeholder = "Enter kg";
        customWeightInput.style.width = "70px";
        customWeightInput.style.padding = "0.3rem";
        customWeightInput.style.border = "1px solid #ccc";
        customWeightInput.style.borderRadius = "4px";

        const saveWeightBtn = document.createElement('button');
        saveWeightBtn.textContent = "Set Custom Kg";
        saveWeightBtn.style.padding = "0.5rem";
        saveWeightBtn.style.cursor = "pointer";
        saveWeightBtn.style.width = "100px";
        saveWeightBtn.style.textAlign = "center";

        saveWeightBtn.addEventListener('click', () => {
            if (!isSetedKg) {
                const val = customWeightInput.value;
                if (val != null) {
                    if (Number(val) > 0) {
                        if (Number(val) != Number(0.1) 
                            && Number(val) != Number(0.25)
                            && Number(val) != Number(0.5)
                            && Number(val) != Number(1)
                            && Number(val) != Number(2)
                            && Number(val) != Number(5)){
                            isSetedKg = true;
                            specialWeight = val;
                            customWeightInput.replaceWith(document.createTextNode(`${specialWeight} kg`));
                            row.removeChild(saveWeightBtn);
                        }else {
                            alert("Bu paketler zaten var...");
                        }
                    }else {
                        alert("Kilogram - veya 0 olamaz...");
                    }
                }else {
                    alert("Lütfen geçerli bir değer giriniz...");
                }
            }else {
                alert("Custom paket değiştirilemez...");
            }
        })
        // Minus 100 Button
        const minusThousandBtn = document.createElement('button');
        minusThousandBtn.textContent = "-100";
        styleButton(minusThousandBtn);

        // Minus 10 Button
        const minusTenBtn = document.createElement('button');
        minusTenBtn.textContent = "-10";
        styleButton(minusTenBtn);

        // Minus Button
        const minusBtn = document.createElement('button');
        minusBtn.textContent = "-";
        styleButton(minusBtn);

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

        // Plus 100 Button
        const plusThousandBtn = document.createElement('button');
        plusThousandBtn.textContent = "+100";
        styleButton(plusThousandBtn);

        // Button Actions
        plusBtn.addEventListener('click', () => updateCount(1));
        minusBtn.addEventListener('click', () => updateCount(-1));
        plusTenBtn.addEventListener('click', () => updateCount(10));
        minusTenBtn.addEventListener('click', () => updateCount(-10));
        plusThousandBtn.addEventListener('click', () => updateCount(100));
        minusThousandBtn.addEventListener('click', () => updateCount(-100));

        function updateCount(amount) {
            specialWeight = customWeightInput.value;
            if (specialWeight <= 0) {
                alert("Please enter a valid weight before proceeding!");
                return;
            }

            // Kilogram sabitleniyor, input alanı görüntüye dönüyor
            if (customWeightInput.parentElement) {
                specialWeight = parseFloat(customWeightInput.value);
                customWeightInput.replaceWith(document.createTextNode(`${specialWeight} kg`));
            }

            const addedWeight = specialWeight * Math.abs(amount);
            if (amount > 0 && totalPackagedWeight + addedWeight > inventoryWeight) {
                alert("Not enough product in inventory!");
                return;
            }

            if (amount < 0 && count + amount < 0) {
                return; // Negatif değerlere izin verme
            }

            count += amount;
            totalPackagedWeight += amount * specialWeight;
            countDisplay.textContent = count;
            totalWeightDisplay.textContent = `Total Packaged: ${totalPackagedWeight.toFixed(2)} kg`;

            // Paketleme verilerini kaydet
            specialPackagedData[`Custom`] = {
                weight: specialWeight,
                count: count,
                total: count * specialWeight
            };
        }

        // Append elements to row
        row.appendChild(categoryLabel);
        row.appendChild(customWeightInput);
        row.appendChild(saveWeightBtn);
        row.appendChild(minusThousandBtn);
        row.appendChild(minusTenBtn);
        row.appendChild(minusBtn);
        row.appendChild(countDisplay);
        row.appendChild(plusBtn);
        row.appendChild(plusTenBtn);
        row.appendChild(plusThousandBtn);

        selectedProductContainer.appendChild(row);
    }
});


function specialCloseButton() {
    const parentDiv = document.getElementById('special-search-product-btn').parentElement;

    // Buton zaten varsa ve ebeveyni içinde bulunuyorsa kaldır
    const closeBtnElement = document.getElementById('special-close-button');
    if (closeBtnElement && parentDiv.contains(closeBtnElement)) {
        parentDiv.removeChild(closeBtnElement);
    } else {
        // Yeni buton oluştur
        const closeBtnElement = document.createElement('button');
        closeBtnElement.id = 'special-close-button';
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
            const selectedContainer = document.getElementById('special-selected-product-container');
            if (selectedContainer) {
                selectedContainer.innerHTML = "";
            }
            specialIsSearching = false;
            specialSearchProductBtn.textContent = "Search";
            parentDiv.removeChild(closeBtnElement); // Butonu kaldır
        });
    }
}

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

    // Minus 100 Button
    const minusThousandBtn = document.createElement('button');
    minusThousandBtn.textContent = "-100";
    styleButton(minusThousandBtn);

    // Minus 10 Button
    const minusTenBtn = document.createElement('button');
    minusTenBtn.textContent = "-10";
    styleButton(minusTenBtn);

    // Minus Button
    const minusBtn = document.createElement('button');
    minusBtn.textContent = "-";
    styleButton(minusBtn);

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

    // Plus 100 Button
    const plusThousandBtn = document.createElement('button');
    plusThousandBtn.textContent = "+100";
    styleButton(plusThousandBtn);

    // Button Actions
    plusBtn.addEventListener('click', () => updateCount(1));
    minusBtn.addEventListener('click', () => updateCount(-1));
    plusTenBtn.addEventListener('click', () => updateCount(10));
    minusTenBtn.addEventListener('click', () => updateCount(-10));
    plusThousandBtn.addEventListener('click', () => updateCount(100));
    minusThousandBtn.addEventListener('click', () => updateCount(-100));

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
    row.appendChild(minusThousandBtn);
    row.appendChild(minusTenBtn);
    row.appendChild(minusBtn);
    row.appendChild(countDisplay);
    row.appendChild(plusBtn);
    row.appendChild(plusTenBtn);
    row.appendChild(plusThousandBtn);

    // Add row to the container
    const selectedProductContainer = document.getElementById('selected-product-container');
    selectedProductContainer.appendChild(row);
}

function savePackages(selectedProductId, isCustom) {
    let data = packagedData;
    if (isCustom) {
        data = specialPackagedData;
    }
    const product = inventory[selectedProductId];
    let used = 0;

    if (!product.packages) {
        product.packages = {}; // Eğer tanımlı değilse boş bir obje olarak başlat
    }
    const array = [];

    for (const typeLabel in data) {
        if (data[typeLabel].count > 0) { // Sadece paketlenenleri al
            const count = data[typeLabel].count; // Paketlenen adet
            const total = data[typeLabel].total; // Toplam ağırlık
            const weight = Number(data[typeLabel].weight);

            array.push(data[typeLabel]);
            
            if (product.packages[typeLabel]) {
                // Eğer typeLabel zaten varsa, mevcut count değerini artır
                product.packages[typeLabel].count += Number(count);
            } else {
                // Eğer typeLabel yoksa, yeni bir giriş oluştur
                product.packages[typeLabel] = {
                    type: typeLabel,
                    count,
                    weight
                };
            }
            

            used += Number(total); // Kullanılan toplam ağırlığı hesapla
        }
    }

    logs[returnCurrentDate()] = {
        type:'packaging_product',
        date: returnCurrentDate(),
        boughtProductId: product.boughtProductId,
        packages: array
    }


    if (product.packagedWeight) {
        product.packagedWeight += Number(used);
    }else{
        product.packagedWeight = Number(used);
    }

    product.weight -= Number(used); // Stoktan kullanılan ağırlığı düş
    saveDataToLocalStorage(); // Veriyi LocalStorage'a kaydet
    setInvisibleProductTable();
}

document.getElementById('search-value').addEventListener('change', ()=> {
    const existingTable = document.getElementById('selected-product-container');
    if (existingTable) {
        closeButton();
        isSearching = false;
        searchProductBtn.textContent = 'Search';
        existingTable.parentElement.removeChild(existingTable); // Remove the entire table
    } 
})

document.getElementById('special-search-value').addEventListener('change', ()=> {
    const existingTable = document.getElementById('special-selected-product-container');
    if (existingTable) {
        specialCloseButton();
        specialIsSearching = false;
        specialSearchProductBtn.textContent = 'Search';
        existingTable.parentElement.removeChild(existingTable); // Remove the entire table
    } 
})

// Function to style buttons
function styleButton(button) {
    button.style.padding = "0.5rem";
    button.style.cursor = "pointer";
    button.style.width = "50px";
    button.style.textAlign = "center";
}
document.getElementById('edit-package-value').addEventListener('change', ()=> {
    const existingTable = document.getElementById('packages-table');
    if (existingTable) {
        searchEditPackageBtn.textContent = 'Search';
        existingTable.parentElement.removeChild(existingTable); // Remove the entire table
    } 
})

searchEditPackageBtn.addEventListener('click', () => {
    const boughtProductId = document.getElementById('edit-package-value').value;
    let packages = {};
    // Check if the table already exists
    const existingTable = document.getElementById('packages-table');
    if (existingTable) {
        searchEditPackageBtn.textContent = 'Search';
        existingTable.parentElement.removeChild(existingTable); // Remove the entire table
    } else {
        searchEditPackageBtn.textContent = 'Close';
            // Get the container where the table should be added
            const section = document.getElementById('edit-packages');

            // Create the table element
            const table = document.createElement('table');
            table.id = "packages-table";
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";
            table.style.marginTop = "1rem";

            // Create the table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ["ProductName", "Small (0.1Kg)", "Medium (0.25Kg)", "Large (0.5Kg)", "Extra Large (1Kg)", "Family Pack (2Kg)", "Bulk Pack (5Kg)", "Custom"];

            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                th.style.border = "1px solid #ddd";
                th.style.padding = "0.75rem";
                th.style.textAlign = "center";
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create the table body
            const tbody = document.createElement('tbody');
            tbody.id = "packages-table-body";

            const product = inventory[boughtProductId];
            packages = product.packages;

            if (!inventory[boughtProductId].packages) {
                packages ={}; 
            }

            // Create a row for the product
            const row = document.createElement('tr');

            // Add the product name as the first cell
            const productNameCell = document.createElement('td');
            productNameCell.textContent = product.productName;
            productNameCell.style.border = "1px solid #ddd";
            productNameCell.style.padding = "0.75rem";
            productNameCell.style.textAlign = "center";
            row.appendChild(productNameCell);


            // Add package counts for each type as cells
            const headerKeys = ["Small", "Medium", "Large", "Extra Large", "Family Pack", "Bulk Pack", "Custom"];
            headerKeys.forEach(type => {
                if (type == 'Custom') {
                    const packageCell = document.createElement('td');
                    packageCell.textContent = packages[type] ? `${packages[type].count} (${packages[type].weight}Kg)` : "-";
                    packageCell.style.border = "1px solid #ddd";
                    packageCell.style.padding = "0.75rem";
                    packageCell.style.textAlign = "center";
                    row.appendChild(packageCell);
                }else {
                    const packageCell = document.createElement('td');
                    packageCell.textContent = packages[type] ? `${packages[type].count}` : "-";
                    packageCell.style.border = "1px solid #ddd";
                    packageCell.style.padding = "0.75rem";
                    packageCell.style.textAlign = "center";
                    row.appendChild(packageCell);
                }
            });

        
            const buttonCell = document.createElement('td');
            buttonCell.classList.add('button-cell');

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add('delete-button');

        
            deleteBtn.addEventListener('click', () => {
                // Delete Row
                table.parentElement.removeChild(table); // Tabloyu sil
                searchEditPackageBtn.textContent = 'Search';
                product.weight += Number(product.packagedWeight);
                logs[returnCurrentDate()] = {
                    type:'delete_package',
                    date: returnCurrentDate(),
                    boughtProductId: product.boughtProductId,
                    packages: product.packages
                }
                delete product.packages;
                product.packagedWeight = Number(0);
                
                saveDataToLocalStorage();
            });
            
            

            buttonCell.appendChild(deleteBtn);
            row.appendChild(buttonCell);
            tbody.appendChild(row);
            table.appendChild(tbody);
            
            

            // Append the table to the section
            section.appendChild(table);
            
    }
});
