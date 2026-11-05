"use strict";

(() => {
  const form = document.querySelector("#product-form");
  if (!form) return;

  const sizeError = document.querySelector("#size-error");
  const bagCount = document.querySelector("#bag-count");
  const bagStatus = document.querySelector("#bag-status");
  const bagItems = document.querySelector("#bag-items");
  const clearBag = document.querySelector("#clear-bag");
  const bagToast = document.querySelector("#bag-toast");
  const bagToastMessage = document.querySelector("#bag-toast-message");
  const bagToastDismiss = document.querySelector("#bag-toast-dismiss");
  const bagToastLink = bagToast.querySelector("a");
  const bagTotal = document.querySelector("#bag-total");
  const demoPriceCents = Number(
    document.querySelector(".price").dataset.priceCents,
  );
  const galleryImage = document.querySelector("#shirt-gallery-image");
  const viewLabel = document.querySelector("#view-label");
  const galleryButtons = document.querySelectorAll(".gallery-view-button");
  const formatPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const sizes = ["S", "M", "L", "XL"];
  const bag = [];
  let toastTimeout;

  const hideBagToast = () => {
    window.clearTimeout(toastTimeout);
    bagToast.hidden = true;
  };

  const dismissBagToastAfterDelay = () => {
    if (bagToast.contains(document.activeElement)) {
      toastTimeout = window.setTimeout(dismissBagToastAfterDelay, 1000);
      return;
    }
    hideBagToast();
  };

  const showBagToast = (message) => {
    window.clearTimeout(toastTimeout);
    bagToastMessage.textContent = message;
    bagToast.hidden = false;
    toastTimeout = window.setTimeout(dismissBagToastAfterDelay, 4000);
  };

  const renderBag = () => {
    bagCount.textContent = String(bag.length);
    clearBag.disabled = bag.length === 0;
    bagTotal.textContent = `Fictional demo total: ${formatPrice.format((bag.length * demoPriceCents) / 100)} USD`;
    bagItems.replaceChildren();
    sizes.forEach((size) => {
      const quantity = bag.filter((item) => item === size).length;
      if (!quantity) return;
      const item = document.createElement("li");
      item.textContent = `White T-shirt · Size ${size} · Quantity ${quantity} · ${formatPrice.format(demoPriceCents / 100)} each`;
      bagItems.append(item);
    });
  };

  galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      const isFront = view === "front";
      galleryImage.src = `assets/white-tee-${view}-mockup.webp`;
      galleryImage.alt = `${isFront ? "Front" : "Back"} view of a white T-shirt mockup with sample artwork`;
      viewLabel.textContent = `0${isFront ? "1" : "2"} / ${isFront ? "Front" : "Back"}`;
      galleryButtons.forEach((viewButton) => {
        viewButton.setAttribute("aria-pressed", String(viewButton === button));
      });
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = form.querySelector('input[name="size"]:checked');
    if (!selected || !sizes.includes(selected.value)) {
      sizeError.hidden = false;
      form.querySelectorAll('input[name="size"]').forEach((input) => {
        input.setAttribute("aria-invalid", "true");
      });
      form.querySelector('input[name="size"]').focus();
      return;
    }

    sizeError.hidden = true;
    bag.push(selected.value);
    renderBag();
    const itemWord = bag.length === 1 ? "item" : "items";
    const confirmation = `Added a white T-shirt in size ${selected.value} to your demo bag.`;
    bagStatus.textContent = `${confirmation} Your demo bag has ${bag.length} ${itemWord}. ${bagTotal.textContent}`;
    showBagToast(confirmation);
  });

  form.addEventListener("change", () => {
    sizeError.hidden = true;
    form.querySelectorAll('input[name="size"]').forEach((input) => {
      input.removeAttribute("aria-invalid");
    });
  });

  bagToastDismiss.addEventListener("click", () => {
    hideBagToast();
  });

  bagToastLink.addEventListener("click", () => {
    hideBagToast();
  });

  clearBag.addEventListener("click", () => {
    hideBagToast();
    bag.length = 0;
    renderBag();
    bagStatus.textContent =
      "Your demo bag is empty. Choose a size to try it again.";
    form.querySelector('input[name="size"]:checked')?.focus();
  });
})();
