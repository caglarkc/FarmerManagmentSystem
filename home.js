const inventory = {};

document.addEventListener('DOMContentLoaded', () => {
    loadInventoryFromLocalStorage();
    console.log(inventory);
});

window.onload = () => {
    checkAlerts();
}

function loadInventoryFromLocalStorage() {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
        Object.assign(inventory, JSON.parse(storedInventory));
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
