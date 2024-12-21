const saveSellBtn = document.querySelector('#save-sell-btn');


const farmers = {};
const products = {};
const purchases = {};
const inventory = {};
const onSales = {};


document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    populateProductSelector();
    renderProductCards();
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
});


function loadDataFromLocalStorage() {
    loadProductsFromLocalStorage();
    loadFarmersFromLocalStorage();
    loadPurchasesFromLocalStorage();
    loadInventoryFromLocalStorage();
    loadOnSalesFromLocalStorage();
}
function saveDataToLocalStorage() {
    saveProductsToLocalStorage();
    saveFarmersToLocalStorage();
    savePurchasesToLocalStorage();
    saveInventoryToLocalStorage();
    saveOnSalesToLocalStorage();
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

// Dropdown'dan seçim yapıldığında çağırılacak
document.getElementById('product-selector').addEventListener('change', (e) => {
    const boughtProductId = e.target.value;
    getSalesByProduct(boughtProductId);
});

// Sayfa yüklendiğinde selector'u doldur
document.addEventListener('DOMContentLoaded', () => {
    populateProductSelector();
});

// Seçilen ürüne göre satış listesini oluştur
function getSalesByProduct(boughtProductId) {
    const container = document.getElementById('sell-products-container');
    container.innerHTML = ''; // Önce içeriği temizle

    const product = inventory[boughtProductId];
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
        let isPackageExist = false;
        const row = document.createElement('div');
        row.classList.add('sell-product-row');
        let p = 0;
        let c = 0;

        for (const onSaleId in onSales) {
            const onSale = onSales[onSaleId];
            if (onSale.boughtProductId == boughtProductId && onSale.packageWeight == packageItem.weight) {
                isPackageExist = true;
                    p = onSale.price;
                    c = onSale.count;
                    break;
            }
        }

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
         const inputCount = document.createElement('input');
         inputCount.type = 'number';
         inputCount.min = '0';
         inputCount.placeholder = 'Enter count';
         inputCount.classList.add('count-input');
         inputCount.dataset.packageType = packageItem.type;

         // Fiyat girişi
         const inputPrice = document.createElement('input');
         inputPrice.type = 'number';
         inputPrice.min = '0';
         inputPrice.placeholder = 'Enter price';
         inputPrice.classList.add('price-input');

         // Checkbox (Tick)
         const checkbox = document.createElement('input');
         checkbox.type = 'checkbox';
         checkbox.classList.add('select-checkbox');
         checkbox.dataset.packageType = packageItem.type;

        if(isPackageExist) {
            soldCount.textContent = `On Sold: ${c} \nPrice: ${p}`;
            inputPrice.disabled = true;
        }
       
        // Satır elemanlarını birleştir
        row.setAttribute('isExist', isPackageExist);
        row.setAttribute('price', p);
        row.appendChild(packageLabel);
        row.appendChild(packageCount);
        row.appendChild(soldCount);
        row.appendChild(inputCount);
        row.appendChild(inputPrice);
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
saveSellBtn.addEventListener('click', () => {
    let isCompleted = true;
    let checkboxCounter = 0;
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
        const isExist = row.getAttribute('isExist');
        const checkbox = row.querySelector('.select-checkbox'); // Checkbox
        const countInput = row.querySelector('.count-input'); // Sayı inputu
        const priceInput = row.querySelector('.price-input'); // Fiyat inputu
        const packageLabel = row.querySelector('.package-label'); // Paket adı (etiket)
        const type = packageLabel.dataset.type;
        const typecount = product.packages[type].count;
        const countValue = parseInt(countInput.value, 10) || 0;
        let priceValue = 0;
        if(isExist) {
            priceValue = row.getAttribute('price');
        }else {
            priceValue = parseInt(priceInput.value, 10) || 0;
        }
        if (checkbox.checked) {
            checkboxCounter += 1;
            if (countValue <= typecount && countValue > 0 && priceValue > 0) { // Checkbox seçiliyse
                isCompleted = true;
                data.push({
                    packageType: type,
                    count: countValue,
                    price: priceValue
                });
                
            
            }else if(countValue > typecount) {
                alert('Bu kadar paketlenmiş ürününüz bulumamaktadır...');
            }else {
                isCompleted = false;
                alert('Sayılar eksi değer veya sıfır olamazlar, lütfen kontrol edin...');
                return;
            }
        }
        
        
    });


    if(checkboxCounter > 0) {
        if (isCompleted) {
            let counter = 0;
            for(const item of data) {
                let isUpdatedOnSale = false;
                const count = item.count;
                const type = item.packageType;
                const price = item.price;
                let productPackagedW = product.packagedWeight;
                const packageWeight = product.packages[type].weight;
                const productName = product.productName;
    
                if (product.packages[type].count == count) {
                    delete product.packages[type];
                    productPackagedW -= Number(count) * Number(packageWeight);
                }else{
                    product.packages[type].count -= Number(count);
                    productPackagedW -= Number(count) * Number(packageWeight);
                }
                product.packagedWeight = productPackagedW;
                const boughtProductId = product.boughtProductId;
    
                for(const onSaleId in onSales) {
                    const onSale = onSales[onSaleId];
                    const pw = onSale.packageWeight;
                    const pn = inventory[onSale.boughtProductId].productName;
                    if (productName == pn) {
                        if (packageWeight == pw) {
                            isUpdatedOnSale = true;
                            onSale.count += Number(count);
                            break;
                        }
                    }
    
                }
    
                if(!isUpdatedOnSale) {
                    const onSaleId = `onSale_${Date.now() + "_" + counter}`;
                    onSales[onSaleId] = {
                        onSaleId,
                        boughtProductId,
                        type,
                        packageWeight,
                        count,
                        price
                    }
                }
                
                counter += 1;
    
                
            }
            saveDataToLocalStorage();
            document.getElementById('sell-products-container').innerHTML = "";
            renderProductCards();
            alert('Başarı ile paketlendi ürünler...');
    
            
        }else {
            calert("HATA ALINDI");
        }
    }else {
        calert("CHECKBOX SEÇİLMEMİŞ");
    }

})

// Images for different weights
const productImages = {
    "0.1": "images/100gr.png", // Replace with real image links
    "0.25": "images/250gr.png",
    "0.5": "images/500gr.png",
    "1": "images/1kg.png",
    "2": "images/2kg.png",
    "5": "images/5kg.png"
};

// Function to render product cards
function renderProductCards() {
    const container = document.getElementById('product-cards-container');
    container.innerHTML = ''; // Clear container

    for (const onSaleId in onSales) {
        const onSale = onSales[onSaleId];
        const boughtProduct = inventory[onSale.boughtProductId];

        
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Product Image
        const productImage = document.createElement('img');
        productImage.src = productImages[onSale.packageWeight] || 'images/5kg.png';
        productImage.alt = `${onSale.type} Image`;

        // Product Details
        const productDetails = document.createElement('div');
        productDetails.classList.add('product-details');

        const productName = document.createElement('h3');
        const name = inventory[onSale.boughtProductId].productName;
        const packageW = onSale.packageWeight
        productName.textContent = `${packageW}Kg ${name}`;

        const productCount = document.createElement('p');
        const count = onSale.count;
        productCount.textContent = `Available Count: ${count}`;

        const productPrice = document.createElement('p');
        const price = onSale.price;
        productPrice.textContent = `Price: $${price}`;

        // Button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit Now';
        editButton.addEventListener('click', () => {
            
        });

        // Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Now';
        deleteButton.style.backgroundColor = 'red';
        deleteButton.addEventListener('click', () => {
    
        });
        // Append elements
        productDetails.appendChild(productName);
        productDetails.appendChild(productCount);
        productDetails.appendChild(productPrice);
        productDetails.appendChild(editButton);
        productDetails.appendChild(deleteButton);

        productCard.appendChild(productImage);
        productCard.appendChild(productDetails);

        container.appendChild(productCard);
    }
}
