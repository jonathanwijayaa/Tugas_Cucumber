Feature: Sauce Demo E-commerce Functionality

  As a user of Sauce Demo
  I want to be able to interact with the site
  So that I can test its core features

  Scenario: Failed login with invalid credential
    Given the user is on the login page
    When the user enters an invalid username and password
    And the user clicks the login button
    Then the user should see a failed message


    Scenario: Successfully adding an item to cart
    Given the user is on the login page
    And the user enters a valid username and password
    And the user clicks the login button
    Then the user should be redirected to the inventory page
    And the user is on the item page
    When the user add item to the cart
    And the user in the item list
    Then item should be seen in the item page

  Scenario: Successfully removing an item from cart
    Given the user is on the login page
    And the user enters a valid username and password
    And the user clicks the login button
    Then the user should be redirected to the inventory page
    And the user is on the item page
    When the user add item to the cart
    And the user in the item list
    When the user remove item to the cart
    Then item shouldn't be seen in the item page

  Scenario: Successfully sorting items by price low to high
    Given the user logs in successfully
    And the user is on the inventory page
    When the user clicks the sort dropdown
    When the user selects "Price (low to high)" from the sort dropdown
    Then the first item should be the cheapest one

  Scenario: Successfully logging out from the application
    Given the user logs in successfully
    When the user clicks the menu button
    And the user clicks the logout button
    Then the user should be redirected to the login page