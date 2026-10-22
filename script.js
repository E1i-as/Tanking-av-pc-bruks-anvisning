// Bruksanvisning: tanking av skole-PC via IPv4
// 1) Bilder: viser et bilde per steg, kan klikkes for å forstørres,
//    og viser en tydelig melding hvis bildefilen mangler
// 2) Avkrysning av ferdige steg (lagres i nettleseren)
// 3) Fremdrift øverst og i sidemenyen
// 4) Markerer hvilket steg man er på mens man blar

(function () {
    "use strict";
  
    var STORAGE_KEY = "tanking-ferdige-steg";
  
    var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
    var railLinks = Array.prototype.slice.call(document.querySelectorAll(".rail__link"));
    var progressBar = document.getElementById("progressBar");
    var doneCount = document.getElementById("doneCount");
    var finishBox = document.getElementById("finish");
    var resetBtn = document.getElementById("resetBtn");
    var printBtn = document.getElementById("printBtn");
  
    // =====================================================
    // 1) BILDER
    // =====================================================
  
    // Melding hvis bildet ikke finnes
    function markMissing(img) {
      var figure = img.closest(".shot");
      if (!figure) return;
      figure.classList.add("is-missing");
      figure.setAttribute("data-path", img.getAttribute("src"));
    }
  
    var images = Array.prototype.slice.call(document.querySelectorAll(".shot img"));
  
    images.forEach(function (img) {
      // Tastaturtilgang: bildet kan åpnes med Enter eller mellomrom
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("title", "Klikk for å forstørre");
  
      img.addEventListener("error", function () { markMissing(img); });
      // Hvis feilen skjedde før scriptet var lastet
      if (img.complete && img.naturalWidth === 0) markMissing(img);
  
      img.addEventListener("click", function () { openLightbox(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(img);
        }
      });
    });
  
    // Forstørret visning
    var box = document.createElement("dialog");
    box.className = "lightbox";
    box.setAttribute("aria-label", "Forstørret bilde");
    box.innerHTML =
      '<button type="button" class="lightbox__close">Lukk</button>' +
      '<img alt="">' +
      "<p></p>";
    document.body.appendChild(box);
  
    var boxImg = box.querySelector("img");
    var boxText = box.querySelector("p");
  
    function openLightbox(img) {
      var caption = img.closest(".shot").querySelector("figcaption");
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      boxText.textContent = caption ? caption.textContent : "";
      if (typeof box.showModal === "function") {
        box.showModal();
      } else {
        window.open(img.src, "_blank");
      }
    }
  
    box.querySelector(".lightbox__close").addEventListener("click", function () {
      box.close();
    });
    // Klikk utenfor bildet lukker
    box.addEventListener("click", function (e) {
      if (e.target === box) box.close();
    });
  
    // =====================================================
    // 2) AVKRYSNING OG FREMDRIFT
    // =====================================================
  
    function loadDone() {
      try {
        var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
      } catch (e) {
        return [];
      }
    }
  
    function saveDone(list) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        // Lagring er ikke tilgjengelig, siden fungerer likevel
      }
    }
  
    function update() {
      var done = [];
  
      steps.forEach(function (step) {
        var cb = step.querySelector(".done__box");
        step.classList.toggle("is-done", cb.checked);
        if (cb.checked) done.push(step.id);
  
        var link = document.querySelector('.rail__link[data-target="' + step.id + '"]');
        if (link) link.classList.toggle("is-done", cb.checked);
      });
  
      progressBar.style.width = (done.length / steps.length) * 100 + "%";
      doneCount.textContent = done.length;
      finishBox.hidden = done.length !== steps.length;
  
      saveDone(done);
    }
  
    var saved = loadDone();
    steps.forEach(function (step) {
      var cb = step.querySelector(".done__box");
      cb.checked = saved.indexOf(step.id) !== -1;
      cb.addEventListener("change", update);
    });
  
    // =====================================================
    // 3) AKTIVT STEG I SIDEMENYEN
    // =====================================================
  
    var sections = ["intro"].concat(steps.map(function (s) { return s.id; }))
      .map(function (id) { return document.getElementById(id); });
  
    function setCurrent(id) {
      railLinks.forEach(function (link) {
        link.classList.toggle("is-current", link.dataset.target === id);
      });
    }
  
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
  
      sections.forEach(function (sec) { if (sec) observer.observe(sec); });
    }
    setCurrent("intro");
  
    // =====================================================
    // 4) KNAPPER
    // =====================================================
  
    resetBtn.addEventListener("click", function () {
      if (!confirm("Vil du fjerne alle avkrysninger og starte på nytt?")) return;
      steps.forEach(function (step) {
        step.querySelector(".done__box").checked = false;
      });
      update();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  
    printBtn.addEventListener("click", function () {
      window.print();
    });
  
    update();
  })();