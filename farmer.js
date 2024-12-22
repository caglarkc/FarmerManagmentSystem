// Validate input fields (Allow Turkish characters and spaces)
const isValidText = (str) => /^[A-Za-zçÇğĞüÜşŞöÖıİ\s]{3,}$/.test(str);
const isValidPhoneNumber = (num) => /^[0-9]{10}$/.test(num);
const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && email.length >= 10;
const isValidNumber = (str) => /^[0-9]+$/.test(str);

let isFarmerTableVisible = false;
let isProductTableVisible = false;
let isSearching = false;
const farmers = {};
const products = {};
const addFarmerBtn = document.querySelector('#add-farmer-btn');
const listFarmerBtn = document.querySelector('#list-farmers-btn');
const searchFarmerBtn = document.querySelector('#search-farmer-btn');
const addProductBtn = document.querySelector('#add-product-btn');
const showProductsBtn = document.querySelector('#show-products-btn');

// Arama sonuçlarını göstermek için bir div ekliyoruz
const searchResultsContainer = document.createElement('div');
searchResultsContainer.id = 'search-results';
document.querySelector('#search-farmer').appendChild(searchResultsContainer);

// Event Listeners for Real-Time Calculation
document.querySelector('#weight').addEventListener('input', calculateTotalPrice);
document.querySelector('#price').addEventListener('input', calculateTotalPrice);

document.addEventListener('DOMContentLoaded', () => {
    loadFarmersFromLocalStorage();
    loadProductsFromLocalStorage();
    setInvisibleFarmerTable();
    setInvisibleProductTable();
    hideSearchResults();
    addDropdowns();
});
function addFarmer(name, location, email, phone){
    if(isValidText(name) && isValidText(location) && isValidEmail(email) && isValidPhoneNumber(phone)) {
        if(!isFarmerInfoExist(name,email,phone)) {
            const farmerId = `farmer_${Date.now()}`;
            const productIds = [];
            farmers[farmerId] = {
                farmerId,
                name,
                email,
                phone,
                location,
                productIds
            };
          clearAddFarmer();
          setInvisibleFarmerTable();
          addDropdowns();
          alert(`Farmer "${name}" added successfully!`);
        }
    }else if (!isValidText(name)){
        alert('Lütfen geçerli bir isim giriniz!');
    }else if(!isValidText(location)){
        alert('Lütfen geçerli bir şehir bilgisi giriniz!');
    }else if(!isValidEmail(email)){
        alert('Lütfen geçerli bir e-posta adresi giriniz!');
    }else if(!isValidPhoneNumber(phone)){
        alert('Lütfen geçerli bir telefon numarası giriniz! (başına 0 koymadan)');
    }
}
function clearAddFarmer() {
    document.querySelector('#name').value = '';
    document.querySelector('#location').value = '';
    document.querySelector('#email').value = '';
    document.querySelector('#phone').value = '';
}
addFarmerBtn.addEventListener('click', () =>{
    const name = document.querySelector('#name').value;
    const location = document.querySelector('#location').value;
    const email = document.querySelector('#email').value;
    const phone = document.querySelector('#phone').value;

    addFarmer(name,location,email,phone);
    saveFarmersToLocalStorage();
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
function loadProductsFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        Object.assign(products, JSON.parse(storedProducts));
    }
}
function setInvisibleFarmerTable() {
    document.getElementById('farmers-table').style.display = 'none'
    listFarmerBtn.textContent = 'Show Farmers';
    document.querySelector('#farmers-table-body').innerHTML = ''; 
    isFarmerTableVisible = false;
}
function setVisibleFarmerTable() {
    document.getElementById('farmers-table').style.display = 'table'
    isFarmerTableVisible = true;
}
function showFarmerListOnTable(farmer) {
    const tableBody = document.querySelector('#farmers-table-body');
    const row = document.createElement('tr');
    const productNames = getProductNames(farmer.productIds); // Ürün isimlerini al
    row.innerHTML = `
        <td>${farmer.name}</td>
        <td>${farmer.location}</td>
        <td>${farmer.email}</td>
        <td>${farmer.phone}</td>
        <td>${productNames}</td>
        <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </td>
    `;

    tableBody.appendChild(row);

    const editBtn = row.querySelector('.edit-btn');
    const deleteBtn = row.querySelector('.delete-btn');

    editBtn.addEventListener('click', () => {
        editBtnFarmer(row,farmer);
    });

    deleteBtn.addEventListener('click', () => {
        deleteBtnFarmer(farmer);
    });
}
listFarmerBtn.addEventListener('click', () => {
    if(isFarmerTableVisible) {
        setInvisibleFarmerTable();   
    }else {
        setVisibleFarmerTable();
        // Her bir çiftçiyi döndürmek için for...in kullanıyoruz
        for (const farmerId in farmers) {
            const farmer = farmers[farmerId];
            showFarmerListOnTable(farmer);
        }
        listFarmerBtn.textContent = 'Close Table';
    }
});
function isFarmerInfoExist(name,email,phone) {
    for (const farmerId in farmers) {
        const farmer = farmers[farmerId];
        if(farmer.name == name || farmer.email == email || farmer.phone == phone) {
            if(farmer.name == name) {
                alert('Farmer name is exist...');
            }else if(farmer.email == email) {
                alert('Farmer email is exist...'); 
            }else if(farmer.phone == phone) {
                alert('Farmer phone is exist...'); 
            }
            return true;
        }
    }
    return false;
}
function editBtnFarmer(row,farmer) {
    const cells = row.querySelectorAll('td');

    // Hücreleri input alanlarına dönüştür
    cells[0].innerHTML = `<input type="text" value="${farmer.name}">`;
    cells[1].innerHTML = `<input type="text" value="${farmer.location}">`;
    cells[2].innerHTML = `<input type="email" value="${farmer.email}">`;
    cells[3].innerHTML = `<input type="tel" value="${farmer.phone}">`;

    // Cancel ve Save düğmeleri ekle
    cells[5].innerHTML = `
        <button class="save-btn">Save</button>
        <button class="cancel-btn">Cancel</button>
    `;

    // Cancel düğmesine tıklama olayını dinle
    const cancelBtn = cells[5].querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        cancelUpdateFarmer(row, farmer);
    });

    // Save düğmesine tıklama olayını dinle
    const saveBtn = cells[5].querySelector('.save-btn');
    saveBtn.addEventListener('click', () => {
        saveUpdateFarmer(row, farmer);
    });

}
function cancelUpdateFarmer(row, farmer) {
    const cells = row.querySelectorAll('td');

    // Hücrelere orijinal değerlerini geri yükle
    cells[0].innerHTML = farmer.name;
    cells[1].innerHTML = farmer.location;
    cells[2].innerHTML = farmer.email;
    cells[3].innerHTML = farmer.phone;

    // Düzenleme butonlarını geri yükle
    cells[5].innerHTML = `
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    `;

    // Yeni düzenleme ve silme olaylarını ekle
    const editBtn = cells[5].querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
        editBtnFarmer(row, farmer);
    });

    const deleteBtn = cells[5].querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        deleteBtnFarmer(farmer);
    });
}
function saveUpdateFarmer(row, farmer) {
    const cells = row.querySelectorAll('td');

    // Input değerlerini al
    const name = cells[0].querySelector('input').value;
    const location = cells[1].querySelector('input').value;
    const email = cells[2].querySelector('input').value;
    const phone = cells[3].querySelector('input').value;
    const farmerId = farmer.farmerId;

    if(farmer.name == name && farmer.location == location && farmer.email == email && farmer.phone == phone) {
        alert('All infos are same...');
        cancelUpdateFarmer(row,farmer);

    }else {
        if(isValidText(name) && isValidText(location) && isValidEmail(email) && isValidPhoneNumber(phone)) {
            if(!isFarmerInfoExistForUpdate(name,email,phone,farmerId)) {
                const productIds = [];
                delete farmers[farmer.farmerId];
                farmers[farmerId] = {
                    farmerId,
                    name,
                    email,
                    phone,
                    location,
                    productIds
                };
                clearAddFarmer();
                setInvisibleFarmerTable();
                saveFarmersToLocalStorage();
                alert(`Farmer "${name}" updated successfully!`);
            }
        }else if (!isValidText(name)){
            alert('Lütfen geçerli bir isim giriniz!');
        }else if(!isValidText(location)){
            alert('Lütfen geçerli bir şehir bilgisi giriniz!');
        }else if(!isValidEmail(email)){
            alert('Lütfen geçerli bir e-posta adresi giriniz!');
        }else if(!isValidPhoneNumber(phone)){
            alert('Lütfen geçerli bir telefon numarası giriniz! (başına 0 koymadan)');
        }
        // Güncellenen değerleri tabloya geri yükle
        cancelUpdateFarmer(row, farmer);
    }

    
}
function isFarmerInfoExistForUpdate(name, email, phone, id) {
    for (const farmerId in farmers) {
        if (farmerId == id) {
            // Güncellenen çiftçiyi atla
            continue;
        }

        const farmer = farmers[farmerId];

        // Aynı isim, e-posta veya telefon varsa kontrol et
        if (farmer.name == name || farmer.email == email || farmer.phone == phone) {
            if (farmer.name == name) {
                alert('Farmer name already exists.');
            } else if (farmer.email == email) {
                alert('Farmer email already exists.');
            } else if (farmer.phone == phone) {
                alert('Farmer phone already exists.');
            }
            return true; // Eşleşme bulundu
        }
    }

    return false; // Tüm çiftçiler kontrol edildi ve eşleşme bulunamadı
}
function deleteBtnFarmer(farmer) {
    if(farmers[farmer.farmerId]) {
        delete farmers[farmer.farmerId];
        saveFarmersToLocalStorage();
        addDropdowns();
        clearAddFarmer();
        const addFarmerBtn = document.querySelector('#add-farmer-btn');
        addFarmerBtn.textContent = 'Add Farmer';
        console.log(`Farmer with ID "${farmer.farmerId}" has been deleted.`);
        setInvisibleFarmerTable();
    }else {
        console.log(`Farmer with ID "${farmer.farmerId}" does not exist.`);
    }
    
}
function searchFarmer() {
    clearSearchTable();
    hideSearchResults();
    isSearching = false;
    const searchType = document.querySelector('#search-type').value;
    const searchVal = document.querySelector('#search-farmer-input').value;
    const searchResultsContainer = document.querySelector('#search-results');
    let type = null;

    // Önceki sonuçları temizle
    searchResultsContainer.innerHTML = '';
    
    if (searchType === 'name') {
        type = 'name';
    } else if (searchType === 'location') {
        type = 'location';
    } else if (searchType === 'email') {
        type = 'email';
    } else if (searchType === 'phone') {
        type = 'phone';
    } else if (searchType === 'product') {
        type = 'productName';
    }
    if(type == 'productName') {
        for (const farmerId in farmers) {
            const farmer = farmers[farmerId];
            const productIds = farmer.productIds;
            for (const productId of productIds) {
                const productName = products[productId].productName;
                if(productName == searchVal) {
                    isSearching = true;
                    showSearchResults();
                    addRowToSearchTable(farmer);
                }
            }
        }
    }else {
        for (const farmerId in farmers) {
            const farmer = farmers[farmerId];
            if(farmer[type] == searchVal) {
                isSearching = true;
                showSearchResults();
                addRowToSearchTable(farmer);
            }
        }
    }
    
    if(!isSearching) {
        alert('Dont found...');
    }
    
}
searchFarmerBtn.addEventListener('click' , () => {
    searchFarmer();

});
function showSearchResults() {
    document.getElementById('search-results-table').style.display = 'table'; // Tabloyu görünür yapar
}
function hideSearchResults() {
    document.getElementById('search-results-table').style.display = 'none'; // Tabloyu gizler
}
function addRowToSearchTable(farmer) {
    // Tablo gövdesini seç
    const tableBody = document.getElementById('search-results-body');

    // Yeni bir satır oluştur
    const row = document.createElement('tr');

    // Satırın içeriğini doldur
    row.innerHTML = `
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${farmer.name}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${farmer.location}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${farmer.email}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${farmer.phone}</td>
        <td style="border: 1px solid #ccc; padding: 0.75rem; text-align: center;">${getProductNames(farmer.productIds)}</td>
    `;

    // Satırı tabloya ekle
    tableBody.appendChild(row);
}
function clearSearchTable() {
    const tableBody = document.getElementById('search-results-body');
    tableBody.innerHTML = ''; // Tablo gövdesindeki tüm içerikleri temizler
}
// Dropdown'u doldur
function populateFarmersDropdown() {
    const farmerDropdown = document.getElementById('farmer-names');
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
function addFarmerToProductEdit() {
    const farmerDropdown = document.getElementById('farmer-product-dropdown');
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
function addDropdowns() {
    populateFarmersDropdown();
    addFarmerToProductEdit();
}
addProductBtn.addEventListener('click' , () => {
    const productName = document.querySelector('#product-name').value;
    const weight = document.querySelector('#weight').value;
    const price = document.querySelector('#price').value;
    const farmerId = document.querySelector('#farmer-names').value;
    let farmerName = null;
    if(farmers[farmerId] != null) {
        farmerName = farmers[farmerId].name;
    }

    if (farmerName != null) {
        if (
            isValidText(productName) && 
            isValidNumber(weight) && 
            isValidNumber(price) && 
            Number(weight) > 0 && 
            Number(price) > 0
        ) {
            addProduct(farmerId, productName, weight, price);
        } else if (!isValidText(productName)) {
            alert('Lütfen geçerli bir ürün ismi giriniz!');
        } else if (!isValidNumber(weight) || Number(weight) <= 0) {
            alert('Lütfen geçerli bir kilo giriniz (0 veya negatif olamaz)!');
        } else if (!isValidNumber(price) || Number(price) <= 0) {
            alert('Lütfen geçerli bir fiyat giriniz (0 veya negatif olamaz)!');
        }
    } else {
        alert('Lütfen geçerli bir farmer seçiniz!');
    }
    
})
function addProduct(farmerId,productName,weight,price) {
    let productId = isProductExist(productName,farmerId);
    
    if(productId != null) {
        const w = products[productId]?.weight;
        const p = products[productId]?.price;
        const totalW = Number(w) + Number(weight);
        const averagePrice = ((weight * price) + (w * p)) / (totalW);
        const totalPrice = totalW * averagePrice;

        products[productId].weight = totalW;
        products[productId].price = averagePrice;
        products[productId].totalPrice = totalPrice;
    }else{
        const totalPrice = weight * price;
        productId = `product_${Date.now()}`;
        products[productId] = {
            productId,
            farmerId,
            productName,
            weight,
            price,
            totalPrice
        };
        farmers[farmerId].productIds.push(productId);
    }
    saveFarmersToLocalStorage();
    saveProductsToLocalStorage();
    clearAddProduct();
    setInvisibleFarmerTable();
    setInvisibleProductTable();
    alert(`Product "${productName}" added successfully!`);
}
function isProductExist(productName,farmerId) {
    if(farmers[farmerId]){
        const farmer = farmers[farmerId];
        for (const productId of farmer.productIds) {
            const tempProduct = products[productId]; // productId üzerinden products'a eriş
            if (tempProduct && tempProduct.productName === productName) {
                return productId; // Eşleşme bulunduğunda productId'yi döndür
            }
        }
    }else {
        return null;
    }

}
function clearAddProduct() {
    document.querySelector('#product-name').value = '';
    document.querySelector('#weight').value = '';
    document.querySelector('#price').value = '';
    document.querySelector('#farmer-names').value = 'Select a farmer';
    document.querySelector('#total-price-container').textContent = 'Total Price: 0₺';
}
// Total Price Hesaplama Fonksiyonu
function calculateTotalPrice() {
    const weight = document.querySelector('#weight').value;
    const price = document.querySelector('#price').value;

    // Eğer weight veya price boşsa veya sıfırsa toplam fiyat 0 olur
    const totalPrice = (Number(weight) > 0 && Number(price) > 0) ? (Number(weight) * Number(price)) : 0;

    // Toplam fiyatı güncelle
    document.querySelector('#total-price-container').textContent = `Total Price: ${totalPrice.toFixed(2)}₺`;
}
function getProductNames(productIds) {
    return productIds.map(productId => products[productId]?.productName || 'Unknown').join(', ');
}
function showProductsListOnTable(product) {
    const tableBody = document.querySelector('#products-table-body');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${product.productName}</td>
        <td>${product.weight}</td>
        <td>${product.price}</td>
        <td>${product.totalPrice}</td>
        <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </td>
    `;

    tableBody.appendChild(row);

    const editBtn = row.querySelector('.edit-btn');
    const deleteBtn = row.querySelector('.delete-btn');

    editBtn.addEventListener('click', () => {
        isUpdatingProduct = true;
        editBtnProduct(row,product);
    });

    deleteBtn.addEventListener('click', () => {
        deleteBtnProduct(product);
    });
}
function setInvisibleProductTable() {
    document.getElementById('products-table').style.display = 'none'
    showProductsBtn.textContent = 'Show Products';
    document.querySelector('#products-table-body').innerHTML = ''; 
    isProductTableVisible = false;
}
function setVisibleProductTable() {
    document.getElementById('products-table').style.display = 'table'
    isProductTableVisible = true;
}
showProductsBtn.addEventListener('click', () => {
    if(isProductTableVisible) {
        setInvisibleProductTable();   
    }else {
        setVisibleProductTable();
        const farmerId = document.getElementById('farmer-product-dropdown').value;
        // Her bir product döndürmek için for...in kullanıyoruz
        for (const productId of farmers[farmerId].productIds) {
            const product = products[productId];
            showProductsListOnTable(product);
        }
        showProductsBtn.textContent = 'Close Table';
    }
})
document.getElementById('farmer-product-dropdown').addEventListener('change', () => {
    setInvisibleProductTable();
})
function editBtnProduct(row,product) {
    const cells = row.querySelectorAll('td');

    // Hücreleri input alanlarına dönüştür
    cells[0].innerHTML = `<input type="text" value="${product.productName}">`;
    cells[1].innerHTML = `<input type="number" value="${product.weight}">`;
    cells[2].innerHTML = `<input type="number" value="${product.price}">`;

    // Cancel ve Save düğmeleri ekle
    cells[4].innerHTML = `
        <button class="save-btn">Save</button>
        <button class="cancel-btn">Cancel</button>
    `;

    // Cancel düğmesine tıklama olayını dinle
    const cancelBtn = cells[4].querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        cancelUpdateProduct(row, product);
    });

    // Save düğmesine tıklama olayını dinle
    const saveBtn = cells[4].querySelector('.save-btn');
    saveBtn.addEventListener('click', () => {
        saveUpdateProduct(row, product);
    });
}
function cancelUpdateProduct(row, product) {
    const cells = row.querySelectorAll('td');

    // Hücrelere orijinal değerlerini geri yükle
    cells[0].innerHTML = product.productName;
    cells[1].innerHTML = product.weight;
    cells[2].innerHTML = product.price;
    cells[3].innerHTML = product.totalPrice;

    // Düzenleme butonlarını geri yükle
    cells[4].innerHTML = `
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    `;

    // Yeni düzenleme ve silme olaylarını ekle
    const editBtn = cells[4].querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
        editBtnProduct(row, product);
    });

    const deleteBtn = cells[4].querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        deleteBtnProduct(product);
    });
}
function saveUpdateProduct(row, product) {
    const cells = row.querySelectorAll('td');

    // Input değerlerini al
    const productName = cells[0].querySelector('input').value;
    const weight = cells[1].querySelector('input').value;
    const price = cells[2].querySelector('input').value;
    let totalPrice = product.totalPrice;
    const productId = product.productId;
    const farmerId = product.farmerId;

    if(product.productName == productName && product.weight == weight && product.price == price) {
        alert('All infos are same...');
        cancelUpdateProduct(row,product);

    }else {
        if(isValidText(productName) && isValidNumber(weight) && isValidNumber(price)) {
            delete products[products.productId];
            totalPrice = weight * price;
            products[productId] = {
                productId,
                farmerId,
                productName,
                weight,
                price,
                totalPrice
            };
            clearAddProduct();
            setInvisibleProductTable();
            saveFarmersToLocalStorage();
            saveProductsToLocalStorage();
            alert(`Product "${productName}" updated successfully!`);
        }else if (!isValidText(name)){
            alert('Lütfen geçerli bir isim giriniz!');
        }else if(!isValidText(location)){
            alert('Lütfen geçerli bir şehir bilgisi giriniz!');
        }else if(!isValidEmail(email)){
            alert('Lütfen geçerli bir e-posta adresi giriniz!');
        }else if(!isValidPhoneNumber(phone)){
            alert('Lütfen geçerli bir telefon numarası giriniz! (başına 0 koymadan)');
        }
        // Güncellenen değerleri tabloya geri yükle
        cancelUpdateProduct(row, product);
    }

    
}
function deleteBtnProduct(product) {
    if(products[product.productId]) {
        delete products[product.productId];
        // Farmers içinde ilgili ürün ID'sini sil
        for (const farmerId in farmers) {
            const farmer = farmers[farmerId];
            // farmer.productIds dizisinde productId'yi bul ve sil
            const index = farmer.productIds.indexOf(product.productId);
            if (index !== -1) {
                farmer.productIds.splice(index, 1); // Diziden ID'yi kaldır
                break; // Daha fazla aramaya gerek yok, işlemi bitir
            }
        }
        saveFarmersToLocalStorage();
        saveProductsToLocalStorage();
        addDropdowns();
        clearAddProduct();
        const addProductBtn = document.querySelector('#add-product-btn');
        addProductBtn.textContent = 'Add Product';
        console.log(`Product with ID "${product.productId}" has been deleted.`);
        setInvisibleProductTable();
    }else {
        console.log(`Product with ID "${product.productId}" does not exist.`);
    }

}

