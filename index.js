import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto("https://pt.aliexpress.com/item/1005003860281880.html");

  const el = await page.$(".product-reviewer-reviews");
  await el.click();

  await page.waitForSelector("#product-evaluation", { timeout: 5000 });

  const reviewsIframeElement = await page.$("#product-evaluation");
  const iframe = await reviewsIframeElement.contentFrame();

  await iframe.waitForSelector(".feedback-item");

  const printReviews = async (page = 1) => {
    await iframe.$(".ui-pagination-next").then(async (button) => {
      if (page > 1) {
        await button.evaluate((b) => b.click());
        await iframe.waitForTimeout(2000);
      }

      await iframe.waitForSelector(".feedback-item");
      const elements = await iframe.$$eval(".feedback-item", (nodes) => {
        const widthToRating = {
          "100%": 5,
          "80%": 4,
          "60%": 3,
          "40%": 2,
          "20%": 1,
        };

        return nodes.map((node) => {
          const rating =
            widthToRating[
              node.querySelector(".fb-main .f-rate-info span span").style.width
            ];

          const description = node.querySelector(
            ".fb-main .f-content dl dt span"
          ).textContent;

          const imageNodes = node.querySelectorAll(
            ".fb-main .f-content dl dd ul li"
          );

          const imagesUrls = Array.from(imageNodes).map((imageNode) => {
            return imageNode.querySelector("img").getAttribute("src");
          });

          return {
            rating,
            description,
            images: imagesUrls,
          };
        });
      });

      console.log(elements);

      printReviews(page + 1);
    });
  };

  printReviews();
})();
