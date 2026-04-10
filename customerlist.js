const API_URL = "https://script.google.com/macros/s/AKfycbxyaaq-jueXTgNY8dNVmwYadMmdpzK-pyFbZ2z8gWJ-Ghx21h_Y64yJVTFAAfM2fYbV/exec";

let allData = [];

async function loadCustomer() {
  const res = await fetch(API_URL);
  allData = await res.json();

  setupLevelFilter(allData);
  render();
}

function isEmpty(val) {
  return val === null || val === undefined || val === "" || val === "-";
}

function getLevelBadge(level) {
  switch (level) {
    case "CEO":
      return "CEO 👑";
    case "VIP":
      return "VIP 💎";
    case "REGULAR":
      return "REGULAR ⭐";
    case "NEW":
      return "NEW 🆕";
    default:
      return level;
  }
}

function setupLevelFilter(data) {
  const select = document.getElementById("levelFilter");

  let levels = [...new Set(
    data.map(c => c.LEVEL).filter(v => !isEmpty(v))
  )];

  const order = ["CEO", "VIP", "REGULAR", "NEW"];

  levels.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);

    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;

    return ia - ib;
  });

  select.innerHTML = `<option value="ALL">ALL LEVEL</option>`;

  levels.forEach(level => {
    select.innerHTML += `<option value="${level}">${getLevelBadge(level)}</option>`;
  });
}

function render() {
  const search = document.getElementById("search").value.toLowerCase();
  const level = document.getElementById("levelFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let data = [...allData];

  data = data.filter(c => !isEmpty(c.NAMA));

  data = data.filter(c =>
    c.NAMA.toLowerCase().includes(search)
  );

  if (level !== "ALL") {
    data = data.filter(c => c.LEVEL === level);
  }

  data.sort((a, b) => {
    return sort === "asc"
      ? Number(a.PROFIT || 0) - Number(b.PROFIT || 0)
      : Number(b.PROFIT || 0) - Number(a.PROFIT || 0);
  });

  const container = document.getElementById("customerList");
  container.innerHTML = "";

  data.forEach(cust => {
    const div = document.createElement("div");
    div.className = "customer-card";

    div.innerHTML = `
      <div class="name">${cust.NAMA}</div>

      <div class="badge">
        ${!isEmpty(cust.LEVEL) ? getLevelBadge(cust.LEVEL) : ""}
      </div>

      ${!isEmpty(cust.TOTAL) ? `
      <div class="row">
        <span>Total</span>
        <span>${cust.TOTAL}</span>
      </div>` : ""}

      ${!isEmpty(cust["TOTAL TRX"]) ? `
      <div class="row">
        <span>TRX</span>
        <span>${cust["TOTAL TRX"]}</span>
      </div>` : ""}

      ${!isEmpty(cust.SPEND) ? `
      <div class="row">
        <span>Spend</span>
        <span>Rp ${Number(cust.SPEND).toLocaleString()}</span>
      </div>` : ""}

      ${!isEmpty(cust.PROFIT) ? `
      <div class="row">
        <span>Profit</span>
        <span>Rp ${Number(cust.PROFIT).toLocaleString()}</span>
      </div>` : ""}
    `;

    container.appendChild(div);
  });
}


document.addEventListener("input", render);
document.addEventListener("change", render);


loadCustomer();
