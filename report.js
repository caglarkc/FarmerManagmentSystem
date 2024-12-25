const purchases = {};
const inventory = {};
const onSales = {};
const deneme = {};

const generateReportBtn = document.getElementById("generate-report");
const inventoryTableBody = document.querySelector("#inventory-report-table tbody");
const purchasesTableBody = document.querySelector("#purchases-report-table tbody");
const ordersTableBody = document.querySelector("#orders-report-table tbody");
const totalTableBody = document.querySelector("#total-report-table tbody");

const type1Section = document.getElementById('report-filters-type1');
const type2Section = document.getElementById('report-filters-type2');
const btnType1 = document.querySelector('#generate-report-type1');
const btnType2 = document.querySelector('#generate-report-type2');



/*
generateReportBtn.addEventListener('click', () => {
    const year = document.getElementById('year-select').value;
    const month = document.getElementById('month-select').value;
    const day = document.getElementById('day-select').value;

    let date = "";
    if (year == 'all-years') {
        date = '1900-01-01_00:00';
    } else if (month == 'all-months') {
        date = year + '-01-01_00:00';
    } else if (day == 'all-days') {
        date = year + '-' + month + '-01_00:00';
    } else {
        date = year + '-' + month + '-' + day + '_00:00';
    }

    console.log(date);
    
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const weekStart = new Date(today);
    const day2 = today.getDay();
    const diffToMonday = day2 === 0 ? -6 : 1 - day2; // Pazar için -6, diğer günler için 1 - gün
    weekStart.setDate(today.getDate() + diffToMonday);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    const timePeriod = document.getElementById("time-period").value;

    let startDate;

    if (timePeriod === 'daily') {
        startDate = today;
    } else if (timePeriod === 'weekly') {
        startDate = weekStart;
    } else if (timePeriod === 'monthly') {
        startDate = monthStart;
    } else if (timePeriod === 'yearly') {
        startDate = yearStart;
    } else if (timePeriod === 'all-time') {
        startDate = new Date(1000, 0, 1);
    }

    const result = Object.keys(deneme)
        .filter(purchaseId => {
            const purchaseDate = new Date(deneme[purchaseId].date.replace("_", "T"));
            return purchaseDate >= startDate && purchaseDate <= today;
        })
        .map(purchaseId => deneme[purchaseId]);

    console.log(result);


    generateInventoryReport(timePeriod);
    generatePurchasesReport(timePeriod);
    generateOrdersReport(timePeriod);
    generateTotalReport(timePeriod);
    
})
*/


btnType1.addEventListener('click', () => {
    let year = document.getElementById("year-select").value;
    let month = document.getElementById("month-select").value;
    let day = document.getElementById("day-select").value;
    let startDate = null;
    if (year == 'all-years') {
        year = '1950';
    }
    if (month == 'all-months') {
        month = '01';
    }
    if (day == 'all-days') {
        day = '01';
    }
    startDate = year + '-' + month + '-' + day + '_00:00';
    
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
    const date = `${year}-${month}-${day}_${hours}:${minutes}`;

    console.log(date);

})

function generateInventoryReport(timePeriod) {
    inventoryTableBody.innerHTML = "";
}
function generatePurchasesReport(timePeriod) {
    purchasesTableBody.innerHTML = "";
}
function generateOrdersReport(timePeriod) {
    ordersTableBody.innerHTML = "";
}
function generateTotalReport(timePeriod) {
    totalTableBody.innerHTML = "";
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










function loadDataFromLocalStorage() {
    loadOnSalesFromLocalStorage();
    loadPurchasesFromLocalStorage();
    loadInventoryFromLocalStorage();
}
function saveDataToLocalStorage() {
    saveOnSalesToLocalStorage();
    savePurchasesToLocalStorage();
    saveInventoryToLocalStorage();
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
