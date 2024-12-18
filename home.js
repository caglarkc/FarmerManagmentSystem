const farmers = {};
const products = {};
const purchases = {};
const inventory = {};

document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    console.log(farmers);
    console.log(products);
    console.log(purchases);
    console.log(inventory);
});

window.onload = () => {
    checkAlerts();
}

function loadDataFromLocalStorage() {
    loadProductsFromLocalStorage();
    loadFarmersFromLocalStorage();
    loadPurchasesFromLocalStorage();
    loadInventoryFromLocalStorage();
}
function loadInventoryFromLocalStorage() {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
        Object.assign(inventory, JSON.parse(storedInventory));
    }
}
function loadFarmersFromLocalStorage() {
    const storedFarmers = localStorage.getItem('farmers');
    if (storedFarmers) {
        Object.assign(farmers, JSON.parse(storedFarmers));
    }
}
function loadProductsFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        Object.assign(products, JSON.parse(storedProducts));
    }
}
function loadPurchasesFromLocalStorage() {
    const storedPurchases = localStorage.getItem('purchases');
    if (storedPurchases) {
        Object.assign(purchases, JSON.parse(storedPurchases));
    }
}
function checkAlerts() {
    for (const productId in inventory) {
        const product = inventory[productId];
        if (product.alert != null && Number(product.weight) < Number(product.alert)) {
            alert(`"${product.productName}" is less than alert level, please check your inventory!`);
        } 
    }
}
