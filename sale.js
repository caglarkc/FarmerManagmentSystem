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



// Sayfa yüklendiğinde selector'u doldur
document.addEventListener('DOMContentLoaded', () => {
    populateProductSelector();
});

// Dropdown'u doldur
function populateProductSelector() {
    const selector = document.getElementById('product-selector');
    selector.innerHTML = "";
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
// Dropdown'dan seçim yapıldığında çağırılacak
document.getElementById('product-selector').addEventListener('change', (e) => {
    const boughtProductId = e.target.value;
    getSalesByProduct(boughtProductId);
});

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

        const onSale = onSales[product.productName];
        if (onSale != null) {
            const packages = onSale.packages;
            for (const type in packages) {
                const pW = packages[type].packageWeight;
                if (pW == packageItem.weight) {
                    isPackageExist = true;
                    p = packages[type].price;
                    c = packages[type].count;
                    break;
                }
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

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const isExist = row.getAttribute('isExist') === 'true';
        const checkbox = row.querySelector('.select-checkbox');
        const countInput = row.querySelector('.count-input');
        const priceInput = row.querySelector('.price-input');
        const packageLabel = row.querySelector('.package-label');
        const type = packageLabel.dataset.type;
        const typecount = product.packages[type].count;
        const countValue = parseInt(countInput.value, 10) || 0;
        let priceValue = 0;
    
        if (isExist) {
            priceValue = row.getAttribute('price');
        } else {
            priceValue = parseInt(priceInput.value, 10) || 0;
        }
    
        if (checkbox.checked) {
            checkboxCounter += 1;
            if (countValue <= typecount && countValue > 0 && priceValue > 0) {
                isCompleted = true;
                data.push({
                    packageType: type,
                    count: countValue,
                    price: priceValue,
                });
            } else if (countValue > typecount) {
                isCompleted = false;
                alert('Bu kadar paketlenmiş ürününüz bulumamaktadır...');
                break; // Döngüyü tamamen durdurur
            } else {
                isCompleted = false;
                alert('Sayılar eksi değer veya sıfır olamazlar, lütfen kontrol edin...');
                break; // Döngüyü tamamen durdurur
            }
        }
    }
    


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
    
                for(const productName in onSales) {
                    const onSale = onSales[productName];
                    const packages = onSale.packages;
                    for (const type in packages) {
                        if (productName == product.productName  && type == item.packageType) {
                            isUpdatedOnSale = true;
                            onSale.packages[type].count += Number(count);
                            break;
                        }
                    }
                }

                
                if(!isUpdatedOnSale) {
                    if (!onSales[productName]) {
                        onSales[productName] = {
                            productName,
                            packages: {}
                        };
                    }
                    
                    // Eğer `packages` zaten varsa, üzerine yazmadan yeni bir paket ekleyin
                    onSales[productName].packages[type] = {
                        type,
                        packageWeight,
                        count,
                        price
                    };
                }else {
                }
                
                counter += 1;
    
                
            }
            saveDataToLocalStorage();
            document.getElementById('sell-products-container').innerHTML = "";
            renderProductCards();
            alert('Başarı ile paketlendi ürünler...');
            populateProductSelector();
        
            
        }else {
            alert("HATA ALINDI");
        }
    }else {
        alert("CHECKBOX SEÇİLMEMİŞ");
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
            let isEditing = false; // Boolean to track editing state
            
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
            productCount.setAttribute('contenteditable', false);

            const productPrice = document.createElement('p');
            const price = package.price;
            productPrice.textContent = `Price: $${price}`;
            productPrice.classList.add('product-price');
            productPrice.setAttribute('contenteditable', false);

            // Edit Button
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit Now';
            editButton.classList.add('edit-button');

            // Delete Button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete Now';
            deleteButton.classList.add('delete-button');

            // Edit Button Logic
            editButton.addEventListener('click', () => {
                let availablePackage = 0;
                let boughtProduct = null;
                for (const boughtProductId in inventory) {
                    if (inventory[boughtProductId].productName == productName) {
                        boughtProduct = inventory[boughtProductId];
                        availablePackage = boughtProduct.packages[package.type].count;
                        break;
                    }
                }
                if (isEditing) {
                    // Save mode
                    const newCount = parseInt(productCount.textContent, 10); // Get the raw number
                    const newPrice = parseFloat(productPrice.textContent, 10); // Get the raw number
            
                    if (newCount == count && newPrice == price) {
                        alert('Invalid input! Please enter different count or price.');
                        return;
                    }
                    if (newCount > Number(availablePackage) + Number(package.count)) {
                        alert('Envanterde bu kadar package yok...');
                        return;
                    }

                    if (isNaN(newCount) || isNaN(newPrice) || newCount <= 0 || newPrice <= 0) {
                        alert('Invalid input! Please enter valid numbers for count and price.');
                        return;
                    }
            
                    // Update package data
                    boughtProduct.packages[package.type].count = Number(availablePackage) + Number(package.count) - Number(newCount);
                    package.count = newCount;
                    package.price = newPrice;
                    


            
                    // Add back the formatted text
                    productCount.textContent = `Available Count: ${newCount}`;
                    productPrice.textContent = `Price: $${newPrice}`;
            
                    // Disable editing
                    productCount.setAttribute('contenteditable', false);
                    productPrice.setAttribute('contenteditable', false);
            
                    // Remove editable styles
                    productCount.classList.remove('editable');
                    productPrice.classList.remove('editable');
            
                    // Remove hint
                    const hint = productDetails.querySelector('.available-hint');
                    if (hint) {
                        hint.remove();
                    }
            
                    // Update buttons
                    editButton.textContent = 'Edit Now';
                    deleteButton.textContent = 'Delete Now';
            
                    isEditing = false;
                    saveDataToLocalStorage();
                } else {
                    // Edit mode
                    isEditing = true;
            
                    // Extract numbers from strings
                    const countValue = productCount.textContent.replace(/[^0-9]/g, ''); // Keep only digits
                    const priceValue = productPrice.textContent.replace(/[^0-9.]/g, ''); // Keep digits and decimal point
            
                    // Set raw numbers as text for editing
                    productCount.textContent = countValue;
                    productPrice.textContent = priceValue;
            
                    // Add hint below productCount
                    const hint = document.createElement('small');
                    hint.textContent = `Available in Inventory: ${availablePackage}`;
                    hint.classList.add('available-hint');
                    hint.style.color = '#555';
                    hint.style.fontSize = '12px';
                    productDetails.insertBefore(hint, productPrice);
            
                    // Add editable styles
                    productCount.classList.add('editable');
                    productPrice.classList.add('editable');
            
                    // Enable editing
                    productCount.setAttribute('contenteditable', true);
                    productPrice.setAttribute('contenteditable', true);
            
                    // Update buttons
                    editButton.textContent = 'Save';
                    deleteButton.textContent = 'Close';
                }
            });
            
            deleteButton.addEventListener('click', () => {
                if (isEditing) {
                    // Close mode
                    isEditing = false;
            
                    // Revert changes to original data
                    productCount.textContent = `Available Count: ${package.count}`;
                    productPrice.textContent = `Price: $${package.price}`;
            
                    // Disable editing
                    productCount.setAttribute('contenteditable', false);
                    productPrice.setAttribute('contenteditable', false);
            
                    // Remove editable styles
                    productCount.classList.remove('editable');
                    productPrice.classList.remove('editable');
            
                    // Remove hint
                    const hint = productDetails.querySelector('.available-hint');
                    if (hint) {
                        hint.remove();
                    }
            
                    // Update buttons
                    editButton.textContent = 'Edit Now';
                    deleteButton.textContent = 'Delete Now';
                } else {
                    // Delete mode
                    const confirmation = confirm('Are you sure you want to delete this package?');
                    if (confirmation) {
                        // Remove the product card from the DOM
                        productCard.remove();
            
                        // Optional: Remove package from data

                        for (const boughtProductId in inventory) {
                            if (inventory[boughtProductId].productName == productName) {
                                const boughtProduct = inventory[boughtProductId];
                                boughtProduct.packages[package.type].count += package.count;
                                break;
                            }
                        }
                        delete onSales[productName].packages[package.type];
                        console.log(`${package.type} package deleted.`);
                        saveDataToLocalStorage();
                    }
                }
            });
            

            // Append elements to product details
            productDetails.appendChild(productTitle);
            productDetails.appendChild(productCount);
            productDetails.appendChild(productPrice);
            productDetails.appendChild(editButton);
            productDetails.appendChild(deleteButton);

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


