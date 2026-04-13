const sidebar = document.getElementById('sidebar');
const toggle = document.getElementById('sidebar-toggle');
const closeBtn = document.getElementById('sidebar-close');

if (toggle) {
  toggle.addEventListener('click', () => {
    sidebar.classList.add('active');
    document.body.classList.add('sidebar-open');
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
    document.body.classList.remove('sidebar-open');
  });
}

document.querySelectorAll('.menu-title').forEach(el => {
  el.addEventListener('click', () => {
    const parent = el.closest('.menu-item');
    if (parent) parent.classList.toggle('active');
  });
});

const activePage = window.location.pathname.split("/").pop();

document.querySelectorAll(".menu-title").forEach(link => {
  const href = link.getAttribute("href");

  if (href && href === activePage) {
    link.classList.add("active-link");

    const parent = link.closest(".menu-item");
    if (parent) parent.classList.add("active");
  }
});


const API_URL = "https://script.google.com/macros/s/AKfycbxyaaq-jueXTgNY8dNVmwYadMmdpzK-pyFbZ2z8gWJ-Ghx21h_Y64yJVTFAAfM2fYbV/exec";

let allData = [];
let filteredData = [];

let currentPage = 1;
const itemsPerPage = 10;

let state = {
  search: "",
  level: "ALL",
  sort: "desc"
};


async function loadCustomer() {
  try {
    const res = await fetch(API_URL);
    allData = await res.json();

    setupLevelFilter(allData);
    applyFilter();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function isEmpty(v) {
  return v === null || v === undefined || v === "" || v === "-";
}

function rp(v) {
  return "Rp " + Number(v || 0).toLocaleString("id-ID");
}

function usd(v) {
  return "$ " + Number(v || 0).toLocaleString("en-US");
}

function formatDateOnly(val) {
  if (!val) return "-";
  return val.split("T")[0];
}

function getLevelBadge(level) {
  const map = {
    CEO: "CEO 👑",
    VIP: "VIP 💎",
    REGULAR: "REGULAR ⭐",
    NEW: "NEW 🆕"
  };
  return map[level] || level || "-";
}


function setupLevelFilter(data) {
  const select = document.getElementById("levelFilter");

  let levels = [...new Set(data.map(d => d.LEVEL).filter(v => !isEmpty(v)))];

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
  levels.forEach(l => {
    select.innerHTML += `<option value="${l}">${getLevelBadge(l)}</option>`;
  });
}


function applyFilter() {
  let data = [...allData];

  data = data.filter(d => !isEmpty(d.NAMA));

  if (state.search) {
    data = data.filter(d =>
      (d.NAMA || "").toLowerCase().includes(state.search)
    );
  }

  if (state.level !== "ALL") {
    data = data.filter(d => d.LEVEL === state.level);
  }

  data.sort((a, b) => {
    return state.sort === "asc"
      ? Number(a.PROFIT || 0) - Number(b.PROFIT || 0)
      : Number(b.PROFIT || 0) - Number(a.PROFIT || 0);
  });

  filteredData = data;
  currentPage = 1;
  render();
}


function render() {
  const container = document.getElementById("customerList");
  container.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const pageData = filteredData.slice(start, end);

  pageData.forEach(cust => {
    const div = document.createElement("div");
    div.className = "customer-card";

    div.innerHTML = `
      <div class="name">${cust.NAMA}</div>
      <div class="badge">${getLevelBadge(cust.LEVEL)}</div>

      <div class="row"><span>Total</span><span>${usd(cust.TOTAL)}</span></div>
      <div class="row"><span>TRX</span><span>${cust["TOTAL TRX"] || 0}</span></div>
      <div class="row"><span>Spend</span><span>${rp(cust.SPEND)}</span></div>
      <div class="row"><span>Profit</span><span>${rp(cust.PROFIT)}</span></div>
    `;

    div.onclick = () => openCustomerDetail(cust);
    container.appendChild(div);
  });

  renderPagination();
}


function renderPagination() {
  const container = document.getElementById("pagination");
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="pagination-wrap">

      <button class="page-btn"
        onclick="goToPage(${currentPage - 1})"
        ${currentPage === 1 ? "disabled" : ""}>
        ◀ Prev
      </button>

      <div class="page-info">
        Page ${currentPage} / ${totalPages}
      </div>

      <button class="page-btn"
        onclick="goToPage(${currentPage + 1})"
        ${currentPage === totalPages ? "disabled" : ""}>
        Next ▶
      </button>

    </div>
  `;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  render();
}


document.getElementById("search").addEventListener("input", (e) => {
  state.search = e.target.value.toLowerCase();
  applyFilter();
});

document.getElementById("levelFilter").addEventListener("change", (e) => {
  state.level = e.target.value;
  applyFilter();
});

document.getElementById("sortFilter").addEventListener("change", (e) => {
  state.sort = e.target.value;
  applyFilter();
});


function openCustomerDetail(cust) {
  const html = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <h2>${cust.NAMA}</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;">
        <div><b>LEVEL</b></div><div>${getLevelBadge(cust.LEVEL)}</div>
        <div><b>DATE REGIST</b></div><div>${formatDateOnly(cust["DATE REGIST"])}</div>
        <div><b>LAST TRX</b></div><div>${formatDateOnly(cust["LAST TRX"])}</div>
        <div><b>BOUGHT</b></div><div>${usd(cust.BOUGHT)}</div>
        <div><b>CASBON</b></div><div>${usd(cust.CASBON)}</div>
        <div><b>TRX</b></div><div>${cust["TOTAL TRX"] || 0}</div>
        <div><b>SPEND</b></div><div>${rp(cust.SPEND)}</div>
        <div><b>PROFIT</b></div><div>${rp(cust.PROFIT)}</div>
      </div>
    </div>
  `;

  document.getElementById("modalBody").innerHTML = html;
  document.getElementById("globalModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("globalModal").classList.add("hidden");
}

function outsideClick(e) {
  if (e.target.id === "globalModal") closeModal();
}


loadCustomer();
