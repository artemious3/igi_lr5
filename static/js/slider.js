class Slider {
  currentPage = 0;
  totalPages = 0;
  delayMs = 2000;
  loop = false;
  autoIntervalId = null;
  pag_dots = [];

  constructor() {
    const sliderEl = document.getElementById("slider");

    // Get parameters from data attributes.
    const loop = sliderEl.dataset.loop === 'true';
    const navs = sliderEl.dataset.navs === 'true';
    const pags = sliderEl.dataset.pags === 'true';
    const auto = sliderEl.dataset.auto === 'true';
    const stopMouseHover = sliderEl.dataset.stopMouseHover === 'true';
    const delayMs = sliderEl.dataset.delayMs ? parseInt(sliderEl.dataset.delayMs, 10) : 5000;

    this.delayMs = delayMs;
    var imgs = sliderEl.querySelectorAll(".slider-img");
    this.totalPages = imgs.length;
    this.currentPage = Array.from(imgs).findIndex((c) =>
      c.classList.contains("slider-cur-r"),
    );
    this.loop = loop || auto;
    if (this.currentPage == undefined) {
      this.currentPage = 0;
      console.log("Warning : set default current for slider");
    }
    this.show_nav(navs);
    this.show_pags(pags);
    this.create_pagination();
    this.set_auto_timeout(auto);
    this.set_stop_mouse_hover(stopMouseHover);
    this.update_counter();
  }

  set_stop_mouse_hover(stopMouseHover) {
    if (stopMouseHover) {
      document.getElementById("slider").addEventListener("mouseenter", () => {
        this.clear_auto_timeout();
      });
      document.getElementById("slider").addEventListener("mouseleave", () => {
        this.set_auto_timeout(true);
      });
    }
  }

  show_nav(nav) {
    let prev_btn = document.getElementById("slider-prev-btn");
    let next_btn = document.getElementById("slider-next-btn");
    if (nav) {
      prev_btn.style.display = "default";
      next_btn.style.display = "default";
    } else {
      prev_btn.style.display = "none";
      next_btn.style.display = "none";
    }
  }

  show_pags(pags) {
    let cnt = document.getElementById("slider-counter");
    if (pags) {
      cnt.style.display = "default";
    } else {
      cnt.style.display = "none";
    }
  }

  set_auto_timeout(auto) {
    if (auto) {
      this.autoIntervalId = setInterval(this.next.bind(this), this.delayMs);
    }
  }

  clear_auto_timeout() {
    if (this.autoIntervalId != null) {
      clearInterval(this.autoIntervalId);
    }
  }

  create_pagination() {
    const pagContainer = document.getElementById("slider-pagination");
    if (!pagContainer) return;

    for (let i = 0; i < this.totalPages; i++) {
      const dot = document.createElement("span");
      dot.classList.add("slider-pag-dot");
      dot.addEventListener("click", () => {
        if (i > this.currentPage) {
          this.go_to_index(i, true);
        } else if (i < this.currentPage) {
          this.go_to_index(i, false);
        }
      });
      pagContainer.appendChild(dot);
      this.pag_dots.push(dot);
    }

    if (this.pag_dots.length > 0) {
      this.pag_dots[this.currentPage].classList.add("slider-pag-dot-active");
    }
  }

  add_class_to_img(imgs, idx, cssClass) {
    if (this.loop) {
      imgs[(idx + this.totalPages) % this.totalPages].classList.add(cssClass);
    } else {
      if (idx >= 0 && idx < this.totalPages) {
        imgs[idx].classList.add(cssClass);
      }
    }
  }

  update_counter() {
    document.getElementById("slider-counter").innerHTML =
      (this.currentPage + 1).toString() + "/" + this.totalPages.toString();
  }

  go_to_index(idx, reverse) {
    if (typeof idx != "number" || idx < 0 || idx >= this.totalPages) {
      console.log("Bad index");
      return;
    }

    var imgs = document
      .getElementById("slider")
      .querySelectorAll(".slider-img");

    imgs[this.currentPage].classList.remove("slider-cur-f");
    imgs[this.currentPage].classList.remove("slider-cur-r");
    imgs[
      (this.currentPage - 1 + this.totalPages) % this.totalPages
    ].classList.remove("slider-prev-f");
    imgs[
      (this.currentPage - 1 + this.totalPages) % this.totalPages
    ].classList.remove("slider-prev-r");
    imgs[
      (this.currentPage - 2 + this.totalPages) % this.totalPages
    ].classList.remove("slider-2prev-f");
    imgs[
      (this.currentPage - 2 + this.totalPages) % this.totalPages
    ].classList.remove("slider-2prev-r");
    imgs[
      (this.currentPage + 1 + this.totalPages) % this.totalPages
    ].classList.remove("slider-next-f");
    imgs[
      (this.currentPage + 1 + this.totalPages) % this.totalPages
    ].classList.remove("slider-next-r");
    imgs[
      (this.currentPage + 2 + this.totalPages) % this.totalPages
    ].classList.remove("slider-2next-f");
    imgs[
      (this.currentPage + 2 + this.totalPages) % this.totalPages
    ].classList.remove("slider-2next-r");

    if (reverse) {
      this.add_class_to_img(imgs, idx - 2, "slider-2prev-r");
      this.add_class_to_img(imgs, idx - 1, "slider-prev-r");
      this.add_class_to_img(imgs, idx, "slider-cur-r");
      this.add_class_to_img(imgs, idx + 1, "slider-next-r");
      this.add_class_to_img(imgs, idx + 2, "slider-2next-r");
    } else {
      this.add_class_to_img(imgs, idx - 2, "slider-2prev-f");
      this.add_class_to_img(imgs, idx - 1, "slider-prev-f");
      this.add_class_to_img(imgs, idx, "slider-cur-f");
      this.add_class_to_img(imgs, idx + 1, "slider-next-f");
      this.add_class_to_img(imgs, idx + 2, "slider-2next-f");
    }

    if (this.pag_dots.length > 0) {
      this.pag_dots.forEach((d) => d.classList.remove("slider-pag-dot-active"));
      this.pag_dots[idx].classList.add("slider-pag-dot-active");
    }

    this.currentPage = idx;
    this.update_counter();
    this.clear_auto_timeout();
    this.set_auto_timeout();
  }

  next() {
    const idx = this.currentPage + 1;
    if (this.loop || (idx >= 0 && idx < this.totalPages)) {
      this.go_to_index((idx + this.totalPages) % this.totalPages, true);
    }
  }

  prev() {
    const idx = this.currentPage - 1;
    if (this.loop || (idx >= 0 && idx < this.totalPages)) {
      this.go_to_index((idx + this.totalPages) % this.totalPages, false);
    }
  }
}

let slider = new Slider();

document.getElementById("slider-prev-btn").onclick = function () {
  slider.prev();
};
document.getElementById("slider-next-btn").onclick = function () {
  slider.next();
};
