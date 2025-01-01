const farmers = {};
const products = {};
const purchases = {};
const inventory = {};
const onSales = {};
const orders = {};
const logs = {};
const deneme = {};

const taxValue = 3;

const generateReportBtn = document.getElementById("generate-report");
const inventoryTableBody = document.querySelector("#inventory-report-table tbody");
const purchasesTableBody = document.querySelector("#purchases-report-table tbody");
const ordersTableBody = document.querySelector("#orders-report-table tbody");
const totalTableBody = document.querySelector("#total-report-table tbody");

const type1Section = document.getElementById('report-filters-type1');
const type2Section = document.getElementById('report-filters-type2');
const btnType1 = document.querySelector('#generate-report-type1');
const btnType2 = document.querySelector('#generate-report-type2');


const packagingCategories = [
    { label: "Small", weight: 0.1 },   // 100g -> 0.1kg
    { label: "Medium", weight: 0.25 }, // 250g -> 0.25kg
    { label: "Large", weight: 0.5 },   // 500g -> 0.5kg
    { label: "Extra Large", weight: 1 }, // 1kg
    { label: "Family Pack", weight: 2 }, // 2kg
    { label: "Bulk Pack", weight: 5 },  // 5kg
];

btnType1.addEventListener('click', () => {
    let year = document.getElementById("year-select").value;
    let month = document.getElementById("month-select").value;
    let day = document.getElementById("day-select").value;
    if (year == 'all-years') {
        year = '1950';
    }
    if (month == 'all-months') {
        month = '01';
    }
    if (day == 'all-days') {
        day = '01';
    }
    const startDate = year + '-' + month + '-' + day + '_00:00';
    
    generateInventoryReport(startDate);
    generatePurchasesReport(startDate);
    generateOrdersReport(startDate);
    generateTotalReport(startDate);
    
})

btnType2.addEventListener('click', () => {
    const timePeriod = document.getElementById("time-period").value;
    
    const unformattedDate = new Date();
    
    if (timePeriod == 'daily') {
        unformattedDate.setDate(unformattedDate.getDate() - 1);
    } else if (timePeriod == 'weekly') {
        unformattedDate.setDate(unformattedDate.getDate() - 7);
    } else if (timePeriod == 'monthly') {
        unformattedDate.setMonth(unformattedDate.getMonth() - 1);
    } else if (timePeriod == 'yearly') {
        unformattedDate.setFullYear(unformattedDate.getFullYear() - 1);
    }else {
        unformattedDate.setFullYear(unformattedDate.getFullYear() - 100);
    }

    // Yıl, ay, gün, saat ve dakika bilgilerini al
    const year = unformattedDate.getFullYear();
    const month = String(unformattedDate.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 arasında olduğu için +1 ekliyoruz
    const day = String(unformattedDate.getDate()).padStart(2, '0');
    const hours = String(unformattedDate.getHours()).padStart(2, '0');
    const minutes = String(unformattedDate.getMinutes()).padStart(2, '0');

    // İstenilen formatta birleştir
    const startDate = `${year}-${month}-${day}_${hours}:${minutes}`;

    generateInventoryReport(startDate);
    generatePurchasesReport(startDate);
    generateOrdersReport(startDate);
    generateTotalReport(startDate);

})

function generateInventoryReport(timePeriod) {
    inventoryTableBody.innerHTML = "";

    const formattedStartDate = new Date(timePeriod.replace('_','T'));

    let data = {};

    
    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if (log.type == 'purchase_product') {
                const productName = log.productName;
                const totalWeight = Number(log.weight);
                const averagePrice = Number(log.price);
                const totalCost = Number(totalWeight) * Number(averagePrice);
                const unPackagedWeight = Number(log.weight);

                if (!data[productName]) {
                    const packages = {};
                    const onSalePackages = {};
                    data[productName] = {
                        totalWeight: totalWeight,
                        averagePrice: averagePrice,
                        totalCost: totalCost,
                        unPackagedWeight: unPackagedWeight,
                        packagedWeight: 0,
                        onSaleWeight: 0,
                        selledWeight: 0,
                        moneyFromSells: 0,
                        packages: packages,
                        onSalePackages: onSalePackages
                    };
                }else {
                    data[productName].totalWeight += Number(totalWeight);
                    data[productName].totalCost += Number(totalCost);
                    data[productName].averagePrice = Number(data[productName].totalCost) / Number(data[productName].totalWeight);
                    data[productName].unPackagedWeight += Number(unPackagedWeight);
                }

            }
        }
    }

    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if(log.type == 'packaging_product') {
                const productName = inventory[log.boughtProductId].productName;
                const packages = log.packages;
                for (const no in packages) {
                    const package = packages[no];
                    const weight = Number(package.weight);
                    const packageType = packagingCategories.find(category => category.weight === weight)?.label || "Custom";
                    const count = package.count;
                    const totalWeight = Number(count) * Number(weight);
                    
                    data[productName].unPackagedWeight -= Number(totalWeight);
                    data[productName].packagedWeight += Number(totalWeight);
                    if (data[productName].packages[packageType]) {
                        data[productName].packages[packageType].count += Number(count);
                        
                    }else {
                        data[productName].packages[packageType] = {
                            count,
                            weight
                        }
                    }    

                }

            }
        }
    }

    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if (log.type == 'delete_package') {
                const productName = inventory[log.boughtProductId].productName;
                const packages = log.packages;
                for (const no in packages) {
                    const package = packages[no];
                    const count = package.count;
                    const weight = package.weight;
                    const packageType = packagingCategories.find(category => category.weight === weight)?.label || "Custom";
                    const totalWeight = Number(count) * Number(weight);
                    data[productName].packagedWeight -= Number(totalWeight);
                    data[productName].unPackagedWeight += Number(totalWeight);

                    if (data[productName].packages[packageType]) {
                        data[productName].packages[packageType].count -= Number(count);
                    }
                }
            }
        }
    }

    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if (log.type == 'onSale_package') {
                const productName = log.productName;
                const packages = log.packages;
                for (const no in packages) {
                    const package = packages[no];
                    const type = package.packageType;
                    const count = package.count;
                    const weight = packagingCategories.find(category => category.label === type)?.weight;
                    const totalWeight = Number(count) * Number(weight);

                    data[productName].packagedWeight -= Number(totalWeight);
                    data[productName].onSaleWeight += Number(totalWeight);

                    data[productName].packages[type].count -= Number(count);


                    if (data[productName].onSalePackages[type]) {
                        data[productName].onSalePackages[type].count += Number(count);
                    }else{
                        data[productName].onSalePackages[type] = {
                            count,
                            weight
                        }
                    }
                }
            }
        }
    }

    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if (log.type == 'update_onSale') {
                const productName = log.productName;
                const packageType = log.package;
                const package = data[productName].onSalePackages[packageType];
                const newCount = log.newCount;
                const oldCount = log.oldCount;
                if (oldCount != newCount) {
                    if (oldCount < newCount) {
                        const difCount = Number(newCount) - Number(oldCount);
                        const totalWeight = difCount * package.weight;
                        data[productName].packages[packageType].count -= difCount;
                        data[productName].onSalePackages[packageType].count += difCount;

                        data[productName].packagedWeight -= Number(totalWeight);
                        data[productName].onSaleWeight += Number(totalWeight);
                    }else {
                        const difCount = Number(oldCount) - Number(newCount);
                        const totalWeight = difCount * package.weight;

                        data[productName].packages[packageType].count += difCount;
                        data[productName].onSalePackages[packageType].count -= difCount;

                        data[productName].packagedWeight += Number(totalWeight);
                        data[productName].onSaleWeight -= Number(totalWeight);
                    }
                    
                }
                
            }
        }
    }

    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if (log.type == 'delete_onSale') {
                const productName = log.productName;
                const package = log.packages;
                const count = package.count;
                const weight = package.packageWeight;
                const type = package.type;
                const totalWeight = Number(count) * Number(weight);
                data[productName].packagedWeight += Number(totalWeight);
                data[productName].onSaleWeight -= Number(totalWeight);

                data[productName].packages[type].count += Number(count);

                data[productName].onSalePackages[type].count -= Number(count);
                
            }
        }
    }

    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if (log.type == 'order') {
                const order = orders[log.orderId];
                
                for (const no in order.boughts) {
                    const product = order.boughts[no];
                    const productName = product.productName;
                    const count = product.count;
                    const price = product.price;
                    const packageWeight = product.packageWeight;
                    const totalWeight = Number(count) * Number(packageWeight);
                    const packageType = packagingCategories.find(category => category.weight === packageWeight)?.label;

                    data[productName].onSalePackages[packageType].count -= Number(count);
                    data[productName].onSaleWeight -= Number(totalWeight);
                    data[productName].selledWeight += Number(totalWeight);
                    data[productName].moneyFromSells += Number(price) * Number(count);
                    data[productName].totalWeight -= Number(totalWeight);
                }
            
                
            }
        }
    }

    // Data nesnesindeki her ürünü döngüye alıyoruz
    for (const productName in data) {
        const product = data[productName];

        // Yeni bir satır oluşturuyoruz
        const row = document.createElement("tr");

        // Her sütunu oluşturup satıra ekliyoruz
        const productNameCell = document.createElement("td");
        productNameCell.textContent = productName; // Ürün adı
        row.appendChild(productNameCell);

        const totalWeightCell = document.createElement("td");
        totalWeightCell.textContent = product.totalWeight + 'Kg'; // Toplam ağırlık
        row.appendChild(totalWeightCell);

        const averagePriceCell = document.createElement("td");
        averagePriceCell.textContent = product.averagePrice + '$'; // Ortalama fiyat
        row.appendChild(averagePriceCell);

        const totalCostCell = document.createElement("td");
        totalCostCell.textContent = product.totalCost + '$'; // Toplam maliyet
        row.appendChild(totalCostCell);

        const packagedWeightCell = document.createElement("td");
        packagedWeightCell.textContent = product.packagedWeight + 'Kg'; // Paketlenmiş ağırlık
        row.appendChild(packagedWeightCell);

        const unPackagedWeightCell = document.createElement("td");
        unPackagedWeightCell.textContent = product.unPackagedWeight + 'Kg'; // Paketlenmemiş ağırlık
        row.appendChild(unPackagedWeightCell);

        const onSaleWeightCell = document.createElement("td");
        onSaleWeightCell.textContent = product.onSaleWeight + 'Kg'; // Satışta olan ağırlık
        row.appendChild(onSaleWeightCell);

        // Satırı tabloya ekliyoruz
        inventoryTableBody.appendChild(row);
    }


}
function generatePurchasesReport(timePeriod) {
    purchasesTableBody.innerHTML = "";

    const formattedStartDate = new Date(timePeriod.replace('_','T'));

    let data = {};

    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if (log.type == 'purchase_product') {
                const productName = log.productName;
                const weight = Number(log.weight);
                const averagePrice = Number(log.price);
                const totalCost = Number(weight) * Number(averagePrice);
                if (data[productName]) {
                    data[productName].weight += Number(weight);
                    data[productName].totalCost += Number(totalCost);
                    data[productName].averagePrice = Number(data[productName].totalCost) / Number(data[productName].weight);
                } else{
                    data[productName] = {
                        productName,
                        weight,
                        totalCost,
                        averagePrice
                    }
                }

            }
        }
    }
    // Data nesnesindeki her ürünü döngüye alıyoruz
    for (const productName in data) {
        // Yeni bir satır oluşturuyoruz
        const row = document.createElement("tr");
        const product = data[productName];

        // Her sütunu oluşturup satıra ekliyoruz
        const productNameCell = document.createElement("td");
        productNameCell.textContent = productName; // Ürün adı
        row.appendChild(productNameCell);

        const totalWeightCell = document.createElement("td");
        totalWeightCell.textContent = product.weight + 'Kg'; // Toplam ağırlık
        row.appendChild(totalWeightCell);

        const averagePriceCell = document.createElement("td");
        averagePriceCell.textContent = product.averagePrice + '$'; // Ortalama fiyat
        row.appendChild(averagePriceCell);

        const totalCostCell = document.createElement("td");
        totalCostCell.textContent = product.totalCost + '$'; // Toplam maliyet
        row.appendChild(totalCostCell);


        // Satırı tabloya ekliyoruz
        purchasesTableBody.appendChild(row);
    }

}
function generateOrdersReport(timePeriod) {
    ordersTableBody.innerHTML = "";

    const formattedStartDate = new Date(timePeriod.replace('_','T'));

    let data = {};

    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_','T'));
        if (formattedDate > formattedStartDate) {
            if (log.type == 'order') {   
                
                for (const no in orders[log.orderId].boughts) {
                    const package = orders[log.orderId].boughts[no];
                    const productName = package.productName;
                    const packageWeight = package.packageWeight;
                    const count = package.count;
                    const averagePrice = package.price;
                    const totalWeight = Number(count) * Number(packageWeight);
                    const totalPrice = Number(count) * Number(averagePrice);

                    // `data[productName]` tanımlı mı kontrol et
                    if (!data[productName]) {
                        data[productName] = {
                            totalWeight: 0,
                            totalPrice: 0,
                            packages: {}
                        };
                    }

                    if (data[productName].packages[packageWeight]) {
                        data[productName].packages[packageWeight].count += Number(count);
                    }else {
                        data[productName].packages[packageWeight] = {
                            count,
                            price: averagePrice,
                            packageWeight
                        }
                    }

                    if (data[productName]) {
                        data[productName].totalWeight += Number(totalWeight);
                        data[productName].totalPrice += Number(totalPrice);
                    }

                    
                }
                    



            }
        }
    }
    // Data nesnesindeki her ürünü döngüye alıyoruz
    for (const productName in data) {
        // Yeni bir satır oluşturuyoruz
        const row = document.createElement("tr");
        const product = data[productName];

        // Ürün Adı
        const productNameCell = document.createElement("td");
        productNameCell.textContent = productName; // Ürün adı
        row.appendChild(productNameCell);

        // Satılan Paketler
        const soldPackagesCell = document.createElement("td");
        const packageDetails = Object.entries(product.packages) // `packages` objesini dolaş
            .map(([packageWeight, pkg]) => `${pkg.count} adet (${packageWeight}kg)`)
            .join(", "); // Her paketi "adet (kg)" formatında birleştir
        soldPackagesCell.textContent = packageDetails; // Satılan paket detayları
        row.appendChild(soldPackagesCell);

        // Toplam Ağırlık
        const totalWeightCell = document.createElement("td");
        totalWeightCell.textContent = product.totalWeight + 'Kg'; // Toplam ağırlık
        row.appendChild(totalWeightCell);

        // Ortalama Fiyat
        const averagePriceCell = document.createElement("td");
        averagePriceCell.textContent = (product.totalPrice / product.totalWeight) + '$'; // Ortalama fiyat
        row.appendChild(averagePriceCell);

        // Toplam Fiyat
        const totalPriceSell = document.createElement("td");
        totalPriceSell.textContent = product.totalPrice + '$'; // Toplam maliyet
        row.appendChild(totalPriceSell);

        // Satırı tabloya ekliyoruz
        ordersTableBody.appendChild(row);
    }

}
function generateTotalReport(timePeriod) {
    totalTableBody.innerHTML = ""; // Tabloyu temizle

    const formattedStartDate = new Date(timePeriod.replace('_', 'T'));

    let totalPurchasedWeight = 0;
    let totalSoldWeight = 0;
    let averagePurchaseCost = 0;
    let averageSellingPrice = 0;
    let totalPurchaseCost = 0;
    let totalSalesRevenue = 0;
    let totalProfit = 0;
    let profitMargin = 0;
    

    // Satın alma verilerini işle
    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_', 'T'));
        if (formattedDate > formattedStartDate && log.type === "purchase_product") {
            const weight = Number(log.weight);
            const price = Number(log.price);
            const cost = weight * price;

            totalPurchasedWeight += weight;
            totalPurchaseCost += cost;
        }
    }

    // Satış verilerini işle
    for (const date in logs) {
        const log = logs[date];
        const formattedDate = new Date(date.replace('_', 'T'));
        if (formattedDate > formattedStartDate && log.type === "order") {
            const order = orders[log.orderId];
            
            for (const no in order.boughts) {
                const bought = order.boughts[no];
                const weight = Number(bought.packageWeight) * Number(bought.count);
                const totalPrice = Number(bought.price) * Number(bought.count);

                totalSoldWeight += weight;
                totalSalesRevenue += totalPrice;
            }
                
        }
    }

    averagePurchaseCost = Number(totalPurchaseCost) / Number(totalPurchasedWeight);
    averageSellingPrice = Number(totalSalesRevenue) / Number(totalSoldWeight);

    totalProfit = Number(totalSalesRevenue) - Number(totalPurchaseCost);
    
    

    // Tabloya Verileri Ekle
    const row = document.createElement("tr");

    const purchasedCell = document.createElement("td");
    purchasedCell.textContent = totalPurchasedWeight + 'Kg'; // Toplam satın alınan ürün kg
    row.appendChild(purchasedCell);

    const soldCell = document.createElement("td");
    soldCell.textContent = totalSoldWeight + 'Kg'; // Toplam satılan ürün kg
    row.appendChild(soldCell);

    const avgPurchaseCostCell = document.createElement("td");
    avgPurchaseCostCell.textContent = averagePurchaseCost.toFixed(2) + '$'; // Ortalama satın alma maliyeti
    row.appendChild(avgPurchaseCostCell);

    const avgSellingPriceCell = document.createElement("td");
    avgSellingPriceCell.textContent = averageSellingPrice.toFixed(2) + '$'; // Ortalama satış fiyatı
    row.appendChild(avgSellingPriceCell);

    const totalPurchaseCostCell = document.createElement("td");
    totalPurchaseCostCell.textContent = totalPurchaseCost + '$'; // Toplam satın alma maliyeti
    row.appendChild(totalPurchaseCostCell);

    const totalSalesRevenueCell = document.createElement("td");
    totalSalesRevenueCell.textContent = totalSalesRevenue + '$'; // Toplam satış geliri
    row.appendChild(totalSalesRevenueCell);

    const taxMargin = document.createElement("td");
    taxMargin.textContent = '%' + taxValue; // Toplam satış geliri
    row.appendChild(taxMargin);

    const totalTaxPrice = document.createElement("td");
    totalTaxPrice.textContent = ((totalProfit * taxValue) / 100 ) + '$'; // Toplam satış geliri
    row.appendChild(totalTaxPrice);

    totalProfit -= (totalProfit * taxValue) /100;
    if (totalSalesRevenue < totalPurchaseCost) {
        // Eğer zarar varsa, kar marjını negatif yüzde olarak hesapla
        profitMargin = ((totalProfit / Number(totalPurchaseCost)) * 100).toFixed(2);
    } else {
        // Eğer kar varsa, kar marjını pozitif yüzde olarak hesapla
        profitMargin = ((totalProfit / Number(totalPurchaseCost)) * 100).toFixed(2);
    }
    const profitMarginCell = document.createElement("td");
    profitMarginCell.textContent = `${totalProfit}$ (${profitMargin}%)`; // Toplam kar ve kar marjı
    row.appendChild(profitMarginCell);

    totalTableBody.appendChild(row);
}


function addDateDropdown() {
    const years = document.getElementById('year-select');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        years.appendChild(option);
    }

    const days = document.getElementById('day-select');
    for (let day = 1; day <= 31; day++) {
    const option = document.createElement('option');
    option.value = String(day).padStart(2, '0'); // '01', '02' şeklinde formatlar
    option.textContent = String(day).padStart(2, '0');
    days.appendChild(option);
    }
}







document.querySelectorAll('input[name="search-type"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      if (event.target.value === 'type1') {
        type1Section.style.display = 'block';
        type2Section.style.display = 'none';
      } else if (event.target.value === 'type2') {
        type1Section.style.display = 'none';
        type2Section.style.display = 'block';
      }
    });
  });
  
document.addEventListener("DOMContentLoaded", () => {
    loadDataFromLocalStorage();
    addDateDropdown();
    console.log(logs);






    // Örnek: Geçmişe yönelik veri ekleme
    addBackdatedPurchase("Fresh Blueberries", "farmer_1734867716425", 30, 1000, 1);
    addBackdatedPurchase("Frozen Blueberries", "farmer_1734867716425", 25, 1500, 7);
    addBackdatedPurchase("Organic Blueberries", "farmer_1734867716425", 45, 800, 24);
    addBackdatedPurchase("Dried Blueberries", "farmer_1734867716425", 40, 600, 365);
    addBackdatedPurchase("Canned Blueberries", "farmer_1734867716425", 50, 1200, 3);
    addBackdatedPurchase("Blueberry Powder", "farmer_1734867716425", 40, 5000, 11);
    addBackdatedPurchase("Blueberry Jam", "farmer_1734867716425", 45, 8000, 30);
    addBackdatedPurchase("Freeze-Dried Blueberries", "farmer_1734867716425", 23, 1800, 340);
    addBackdatedPurchase("Blueberry Juice", "farmer_1734867716425", 37, 9000, 0);
    addBackdatedPurchase("Wild Blueberries", "farmer_1734867716425", 22, 1300, 13);
    addBackdatedPurchase("Blueberry Sorbet", "farmer_1734867716425", 155, 1900, 45);
    addBackdatedPurchase("Candied Blueberries", "farmer_1734867716425", 140, 8000, 120);
    
});

// Örnek: Geçmişe yönelik veri ekleme fonksiyonu
function addBackdatedPurchase(productName, farmerId, price, weight, backdateDays) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - backdateDays * 24 * 60 * 60 * 1000);
    const date = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}_${String(pastDate.getHours()).padStart(2, '0')}:${String(pastDate.getMinutes()).padStart(2, '0')}`;
    const purchaseId = `purchase_${Date.now()}_${backdateDays}`;
    const totalPrice = price * weight;

    deneme[purchaseId] = {
        date,
        farmerId,
        price,
        productName,
        purchaseId,
        totalPrice,
        weight,
    };

}


function loadDataFromLocalStorage() {
    loadProductsFromLocalStorage();
    loadFarmersFromLocalStorage();
    loadPurchasesFromLocalStorage();
    loadInventoryFromLocalStorage();
    loadOnSalesFromLocalStorage();
    loadOrdersFromLocalStorage();
    loadLogsFromLocalStorage();
}

function loadLogsFromLocalStorage() {
    const storedLogs = localStorage.getItem('logs');
    if (storedLogs) {
        Object.assign(logs, JSON.parse(storedLogs));
    }
}

function loadInventoryFromLocalStorage() {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
        Object.assign(inventory, JSON.parse(storedInventory));
    }
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

function loadOrdersFromLocalStorage() {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
        Object.assign(orders, JSON.parse(storedOrders));
    }
}
