const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function getScreenshot(html) {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const page = await browser.newPage();
  await page.setViewport({width: 973, height: 525, deviceScaleFactor: 1});
  await page.setContent(html);
  const file = await page.screenshot({type: 'png'});
  await browser.close();
  return file;
}

module.exports = getScreenshot;
