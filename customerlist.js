const API_URL = "https://script.google.com/macros/s/AKfycbxCavM_TxQ4y7t0lWNC6awDvwupJ09vCdkZEoLFrMEZEEWmrAb9yChhERetksYiSwnm/exec";

let allData = [];

async function loadCustomer() {
  const res = await fetch(API_URL);
  allData = await res.json();
  render();
}

function isEmpty(val) {
  return val === null || val === undefined || val === "" || val === "-";
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
        ${!isEmpty(cust.LEVEL) ? cust.LEVEL : ""} 
        ${!isEmpty(cust.BADGES) ? cust.BADGES : ""} 
        ${!isEmpty(cust.DANGER) ? cust.DANGER : ""}
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
