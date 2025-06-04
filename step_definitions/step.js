import { expect } from "chai";
import { Builder, By, until } from "selenium-webdriver";
import { When, Then, Given, setDefaultTimeout, Before, After } from "@cucumber/cucumber";

setDefaultTimeout(60 * 1000);

let driver;

Before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
});

After(async function () {
    if (driver) {
        try {
            await driver.getSession(); // Check if session is still active
            await driver.quit();
        } catch (e) {
            // This catch block handles the NoSuchSessionError if the session already died
            // due to a previous error. It prevents further crashes in After hook.
            if (e.name === 'NoSuchSessionError') {
                console.log("Session already closed or invalid.");
            } else {
                console.error("Error during WebDriver quit:", e);
            }
        }
    }
});

// Refined waitForElement and waitForElementVisibility to be more flexible
const waitForElement = async (locator, timeout = 15000) => { // Increased default timeout
    return await driver.wait(until.elementLocated(locator), timeout);
};

const waitForElementVisibility = async (locator, timeout = 15000) => { // Increased default timeout
    const element = await waitForElement(locator, timeout); // First locate
    return await driver.wait(until.elementIsVisible(element), timeout); // Then wait for visibility
};

const performLogin = async (username, password) => {
  const usernameField = await waitForElement(By.id('user-name'));
  await usernameField.clear();
  await usernameField.sendKeys(username);

  const passwordField = await waitForElement(By.id('password'));
  await passwordField.clear();
  await passwordField.sendKeys(password);

  const loginButton = await waitForElement(By.id('login-button'));
  await loginButton.click();
};

// === Step Definitions ===

Given('the user is on the login page', async function () {
  await driver.get('https://www.saucedemo.com/');
  await waitForElementVisibility(By.id('user-name'));
});

When('the user enters a valid username and password', async function () {
  const usernameField = await waitForElement(By.id('user-name'));
  await usernameField.sendKeys('standard_user');
  const passwordField = await waitForElement(By.id('password'));
  await passwordField.sendKeys('secret_sauce');
});

When('the user enters an invalid username and password', async function () {
  const usernameField = await waitForElement(By.id('user-name'));
  await usernameField.sendKeys('invalid_user');
  const passwordField = await waitForElement(By.id('password'));
  await passwordField.sendKeys('wrong_password');
});

When('the user clicks the login button', async function () {
  const loginButton = await waitForElement(By.id('login-button'));
  await loginButton.click();
});

Then('the user should see a failed message', async function () {
  const errorElement = await waitForElementVisibility(By.css('[data-test="error"]'));
  expect(await errorElement.isDisplayed()).to.be.true;
});

Then('the user should be redirected to the inventory page', async function () {
  await driver.wait(until.urlContains('inventory.html'), 10000);
  await waitForElementVisibility(By.id('inventory_container'));
  const title = await waitForElementVisibility(By.className('title'));
  expect(await title.getText()).to.equal('Products');
});

Given('the user logs in successfully', async function () {
  await driver.get('https://www.saucedemo.com/');
  await performLogin('standard_user', 'secret_sauce');
  await driver.wait(until.urlContains('inventory.html'), 10000);
  await waitForElementVisibility(By.id('inventory_container'));
});

Given('the user is on the item page', async function () {
  await driver.wait(until.urlContains('inventory.html'), 10000);
  await waitForElementVisibility(By.id('inventory_container'));
});

Given('the user is on the inventory page', async function () {
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes('inventory.html')) {
    await driver.get('https://www.saucedemo.com/inventory.html');
  }
  await waitForElementVisibility(By.id('inventory_container'));
});

When('the user add item to the cart', async function () {
    const addButton = await waitForElementVisibility(By.xpath(`(//button[contains(text(),'Add to cart')])[1]`));
    await addButton.click();
});

When('the user in the item list', async function () {
    const inventory = await waitForElementVisibility(By.id('inventory_container'));
    expect(await inventory.isDisplayed()).to.be.true;
});

Then('item should be seen in the item page', async function () {
    const removeButton = await waitForElementVisibility(By.xpath("//button[contains(text(),'Remove')]"), 15000); 
    expect(await removeButton.isDisplayed()).to.be.true;
});


When('the user remove item to the cart', async function () {
    const removeXPath = "//button[contains(text(),'Remove')]";

    const removeButtons = await driver.findElements(By.xpath(removeXPath));

    if (removeButtons.length === 0) {
        throw new Error("Tidak ada tombol Remove yang ditemukan.");
    }
    const removeButton = removeButtons[0];
    await driver.executeScript("arguments[0].scrollIntoView(true);", removeButton);
    await driver.wait(until.elementIsVisible(removeButton), 5000);
    await removeButton.click();
});

Then("item shouldn't be seen in the item page", async function () {
    // This step is correctly structured.
    // Waiting for the 'Add to cart' button to reappear after removal.
    const addButton = await waitForElementVisibility(By.xpath("(//button[contains(text(),'Add to cart')])[1]"), 15000); // Use helper, increased timeout
    expect(await addButton.isDisplayed()).to.be.true;
});

When('the user clicks the sort dropdown', async function () {
  const dropdown = await waitForElementVisibility(By.className('product_sort_container'));
  await dropdown.click();
});

When('the user selects {string} from the sort dropdown', async function (option) {
  const sortOption = await waitForElementVisibility(By.xpath(`//option[text()='${option}']`));
  await sortOption.click();
});

Then('the first item should be the cheapest one', async function () {
  const priceElements = await driver.findElements(By.className('inventory_item_price'));
  const prices = [];

  for (const element of priceElements) {
    const text = await element.getText(); // e.g. "$9.99"
    prices.push(parseFloat(text.replace('$', '')));
  }

  const sorted = [...prices].sort((a, b) => a - b);
  expect(prices[0]).to.equal(sorted[0]);
});

When('the user clicks the menu button', async function () {
    // Pastikan halaman sudah dimuat dan cart icon terlihat
    await waitForElementVisibility(By.id('shopping_cart_container'), 15000);

    const menuButton = await waitForElementVisibility(By.id('react-burger-menu-btn'), 15000);
    await menuButton.click();

    // Tambahan validasi, kadang menu butuh waktu untuk terbuka
    await waitForElementVisibility(By.id('logout_sidebar_link'), 15000);
});

When('the user clicks the logout button', async function () {
  const logout = await waitForElementVisibility(By.id('logout_sidebar_link'));
  await logout.click();
});

Then('the user should be redirected to the login page', async function () {
    const loginButton = await driver.wait(
        until.elementLocated(By.css('*[id="login-button"]')),
        15000,
        'Tombol login tidak muncul setelah logout'
    );
    await driver.wait(until.elementIsVisible(loginButton), 5000);
});