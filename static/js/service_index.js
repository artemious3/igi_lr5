function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class ProductCatalog {
  data = {};
  currentPage = 0;
  itemsPerPage = 3;
  totalPages = null;

  constructor(data) {
    this.data = data;
    this.totalPages = Math.ceil(data.services.length / this.itemsPerPage);
    this.renderServices();
    this.showPager();
  }

  renderServices() {
    const serviceCatalog = document.getElementById("product-catalog");

    let startIdx = this.currentPage * this.itemsPerPage;
    let endIdx = (this.currentPage + 1) * this.itemsPerPage;

    this.data.services.slice(startIdx, endIdx).forEach((service) => {
      const serviceCard = document.createElement("div");
      serviceCard.className = "product-card";

      const infoUrl = `/service/service/${service.id}/service_info/`;
      const addToCartUrl = `/service/service/${service.id}/add/`;

      serviceCard.innerHTML = `
          <div class="product-name">
            ${escapeHtml(service.name)}
          </div>
          <div class="product-price">
            (${parseFloat(service.price).toFixed(2)}$)
          </div>
          <div class="product-actions">
            <a href="${infoUrl}">Info</a>
            <a href="${addToCartUrl}">Add to cart</a>
          </div>
        `;
      serviceCatalog.appendChild(serviceCard);
    });
  }

  changePage(page, force=false) {
    if(this.currentPage == page && !force){
      return;
    }
    this.currentPage = page;
    document.getElementById("product-catalog").innerHTML = "";
    this.renderServices();
    this.showPager();
  }

  showPager() {
    const existingPager = document.getElementById("pager");
    if (existingPager) {
      existingPager.remove();
    }

    const pager = document.createElement("div");
    pager.id = "pager";
    pager.classList.add("pager");

    const pagerSelect = document.createElement("select");
    pagerSelect.innerHTML = `
      <option value="2"> 2 </option>
      <option value="3"> 3 </option>
      <option value="4"> 4 </option>
      <option value="5"> 5 </option>
      `;
    pagerSelect.classList.add("pager-input");
    pagerSelect.value = this.itemsPerPage.toString();

    pagerSelect.addEventListener("change", () => {
      this.itemsPerPage = parseInt(pagerSelect.value,10);
      this.totalPages = Math.ceil(this.data.services.length / this.itemsPerPage);
      this.changePage(0, true);
    });
    pager.appendChild(pagerSelect);


    const prevBtn = document.createElement("button");
    prevBtn.classList.add("pager-btn");
    prevBtn.innerHTML = "<";
    prevBtn.addEventListener("click", (ev) => {
      this.prevPage();
    });
    pager.appendChild(prevBtn);

    for (let i = 0; i < this.totalPages; i++) {
      const btn = document.createElement("button");
      btn.classList.add("pager-btn");
      if(i == this.currentPage){
        btn.classList.add("pager-btn-current");
      }
      btn.innerHTML = (i + 1).toString();
      btn.addEventListener("click", (ev) => {
        this.changePage(i);
      });
      pager.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("pager-btn");
    nextBtn.innerHTML = ">";
    nextBtn.addEventListener("click", (ev) => {
      this.nextPage();
    });
    pager.appendChild(nextBtn);

    document.getElementById("catalog-container").appendChild(pager);
  }

  nextPage() {
    if (this.currentPage >= this.totalPages - 1) {
      return;
    }
    this.changePage(this.currentPage+1);
  }

  prevPage() {
    if (this.currentPage <= 0) {
      return;
    }
    this.changePage(this.currentPage-1);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 0;
  let servicesJson = {};

  fetch("/service/api/services")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const catalog = new ProductCatalog(data);
    })
    .catch((error) => {
      console.error("Error fetching services:", error);

      document.getElementById("product-catalog").innerHTML =
        "<p>Failed to load services. Please try again later.</p>";
    });
});
