(function () {
  const modal = document.getElementById("externalRedirectModal");
  const text = document.getElementById("externalRedirectText");
  const closeBtn = document.getElementById("externalRedirectClose");
  const cancelBtn = document.getElementById("externalRedirectCancel");
  const continueBtn = document.getElementById("externalRedirectContinue");
  const links = Array.from(document.querySelectorAll(".js-external-link[data-url]"));

  if (!modal || !text || !closeBtn || !cancelBtn || !continueBtn || !links.length) {
    return;
  }

  let pendingUrl = "";

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    pendingUrl = "";
  }

  function openModal(url, siteName) {
    pendingUrl = String(url || "").trim();
    if (!pendingUrl) return;
    const label = String(siteName || pendingUrl).trim();
    text.textContent = `Redirecting to "${label}".`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function openUrl(url) {
    const value = String(url || "").trim();
    if (!value) return;
    if (/^mailto:/i.test(value)) {
      window.location.href = value;
      return;
    }
    window.open(value, "_blank", "noopener,noreferrer");
  }

  links.forEach((btn) => {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-url"), btn.getAttribute("data-site"));
    });
  });

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  continueBtn.addEventListener("click", function () {
    const url = pendingUrl;
    closeModal();
    openUrl(url);
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  const devlogScroll = document.getElementById("devlogScroll");
  if (devlogScroll) {
    devlogScroll.scrollTop = 0;
  }
})();
