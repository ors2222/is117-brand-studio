import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("negative: choosing no size explains the problem and keeps the bag empty", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Add to demo bag", exact: true })
    .click();
  await expect(page.locator("#size-error")).toBeVisible();
  await expect(page.locator("#size-error")).not.toBeEmpty();
  await expect(page.locator("#bag-count")).toHaveText("0");
  await expect(page.locator("#bag-toast")).toBeHidden();
});

test("positive: a shopper can choose sizes, add items, and empty the demo bag", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('input[name="size"][value="M"]').check();
  await page
    .getByRole("button", { name: "Add to demo bag", exact: true })
    .click();
  await expect(page.locator("#bag-count")).toHaveText("1");
  await expect(page.locator("#bag-status")).toContainText("M");
  await expect(page.locator("#bag-total")).toHaveText(
    "Fictional demo total: $28.00 USD",
  );
  await expect(page.locator("#bag-items")).toContainText(
    "White T-shirt · Size M · Quantity 1 · $28.00 each",
  );
  await expect(page.locator("#bag-toast")).toBeVisible();
  await expect(page.locator("#bag-toast-message")).toHaveText(
    "Added a white T-shirt in size M to your demo bag.",
  );
  await expect(page.locator(".bag-toast-link")).toBeVisible();
  await page.locator(".bag-toast-link").click();
  await expect(page).toHaveURL(/#demo-bag$/);
  await expect(page.locator("#bag-toast")).toBeHidden();
  await expect(page.locator("#bag-total")).toHaveText(
    "Fictional demo total: $28.00 USD",
  );
  await page.locator('input[name="size"][value="L"]').check();
  await page
    .getByRole("button", { name: "Add to demo bag", exact: true })
    .click();
  await expect(page.locator("#bag-count")).toHaveText("2");
  await expect(page.locator("#bag-toast")).toBeVisible();
  await expect(page.locator("#bag-total")).toHaveText(
    "Fictional demo total: $56.00 USD",
  );
  await expect(page.locator("#bag-items li")).toHaveText([
    "White T-shirt · Size M · Quantity 1 · $28.00 each",
    "White T-shirt · Size L · Quantity 1 · $28.00 each",
  ]);
  await page.locator('input[name="size"][value="M"]').check();
  await page
    .getByRole("button", { name: "Add to demo bag", exact: true })
    .click();
  await expect(page.locator("#bag-count")).toHaveText("3");
  await expect(page.locator("#bag-items li")).toHaveText([
    "White T-shirt · Size M · Quantity 2 · $28.00 each",
    "White T-shirt · Size L · Quantity 1 · $28.00 each",
  ]);
  await expect(page.locator("#bag-total")).toHaveText(
    "Fictional demo total: $84.00 USD",
  );
  await page
    .getByRole("button", { name: "Empty demo bag", exact: true })
    .click();
  await expect(page.locator("#bag-count")).toHaveText("0");
  await expect(page.locator("#bag-toast")).toBeHidden();
  await expect(page.locator("#bag-total")).toHaveText(
    "Fictional demo total: $0.00 USD",
  );
  await page.reload();
  await expect(page.locator("#bag-count")).toHaveText("0");
});

test("the notification dismisses and the persistent demo-bag link still shows the total", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('input[name="size"][value="S"]').check();
  await page
    .getByRole("button", { name: "Add to demo bag", exact: true })
    .click();
  await expect(page.locator("#bag-toast")).toBeVisible();
  await expect(page.locator("#bag-toast")).toHaveCSS(
    "background-color",
    "rgb(0, 0, 0)",
  );
  await expect(page.locator("#bag-toast")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  await expect(page.locator("#bag-total")).toHaveText(
    "Fictional demo total: $28.00 USD",
  );
  await page.waitForTimeout(3000);
  await expect(page.locator("#bag-toast")).toBeVisible();
  await expect(page.locator("#bag-toast")).toBeHidden({ timeout: 5000 });
  await expect(page.locator(".bag-link")).toBeVisible();
  await page.locator(".bag-link").click();
  await expect(page).toHaveURL(/#demo-bag$/);
  await expect(page.locator("#bag-total")).toHaveText(
    "Fictional demo total: $28.00 USD",
  );
});

test("keyboard: the skip link reaches main and the size controls work without a mouse", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip/i });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  // Focus a native radio, then use its real keyboard behavior and the next control.
  await page.locator('input[name="size"][value="S"]').focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('input[name="size"][value="M"]')).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Add to demo bag", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#bag-count")).toHaveText("1");
});

test("the selected brand direction is shared by the storefront and live guide", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#product-title")).toHaveText(
    "Turn your creativity into art and wear it as your statement.",
  );
  await expect(page.locator(".product-intro")).toHaveText(
    "A simple white tee that leaves room for your point of view.",
  );
  await expect(page.locator(".visual-panels .panel")).toHaveCount(3);
  await expect(page.locator(".wordmark")).toHaveAttribute(
    "alt",
    "Proposed Blank Theory wordmark",
  );
  await expect(page.locator(".shirt-image")).toHaveJSProperty("complete", true);
  expect(
    await page.locator(".shirt-image").evaluate((image) => image.naturalWidth),
  ).toBeGreaterThan(0);
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "src",
    "assets/white-tee-front-mockup.webp",
  );
  await expect(page.locator(".gallery-view-button")).toHaveCount(2);
  await page.getByRole("button", { name: "Back view" }).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "src",
    "assets/white-tee-back-mockup.webp",
  );
  await expect(page.getByRole("button", { name: "Back view" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "alt",
    "Back view of a white T-shirt mockup with sample artwork",
  );
  await page.getByRole("button", { name: "Front view" }).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "src",
    "assets/white-tee-front-mockup.webp",
  );
  await expect(page.locator(".image-caption")).toContainText(
    "intended to be sold blank",
  );

  await page.goto("/styleguide.html");
  await expect(page.locator("#guide-title")).toContainText("Blank Theory");
  await expect(page.getByText("Postmodernist-leaning")).toBeVisible();
  await expect(
    page.locator('[data-color-token="--color-panel-coral"]'),
  ).not.toBeEmpty();
  await expect(page.locator(".starter-notice")).toContainText(
    "wordmark is a proposal awaiting review",
  );
});

for (const route of ["/", "/styleguide.html", "/studio.html"]) {
  test(`page integrity and automated accessibility: ${route}`, async ({
    page,
  }) => {
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("response", (response) => {
      if (
        response.url().startsWith("http://127.0.0.1:5174") &&
        response.status() >= 400
      ) {
        failures.push(`${response.status()} ${response.url()}`);
      }
    });
    await page.goto(route);
    await expect(page.getByRole("main")).toBeVisible();
    const brokenImages = await page
      .locator("img")
      .evaluateAll((images) =>
        images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.src),
      );
    expect(brokenImages).toEqual([]);
    const links = await page
      .locator("a[href]")
      .evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute("href")),
      );
    for (const href of links) {
      if (href.startsWith("#")) {
        expect(
          await page.locator(`[id="${href.slice(1)}"]`).count(),
          href,
        ).toBeGreaterThan(0);
      } else if (!/^(https?:|mailto:)/.test(href)) {
        const response = await page.request.get(new URL(href, page.url()).href);
        expect(response.ok(), href).toBeTruthy();
      }
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(failures).toEqual([]);
  });

  test(`narrow screen: readable page without horizontal overflow ${route}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await expect(page.getByRole("main")).toBeVisible();
  });
}
