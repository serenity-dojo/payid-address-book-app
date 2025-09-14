class PayeeSearchPage {
  constructor(page) {
    this.page = page;
    
    // Search input and controls
    this.searchInput = page.locator('input[placeholder*="Search by name"]');
    this.searchButton = page.locator('button:has-text("Search")');
    this.clearSearchButton = page.locator('.clear-search-button');
    
    // Search results
    this.payeeList = page.locator('.payee-list');
    this.payeeListEmpty = page.locator('.payee-list-empty');
    this.payeeItems = page.locator('.payee-item');
    this.payeeNames = page.locator('.payee-name');
    this.payeePayIds = page.locator('.payee-payid');
    this.noResultsMessage = page.locator('.payee-list-empty p');
    
    // Suggestions dropdown
    this.suggestionsDropdown = page.locator('.suggestions-dropdown');
    this.suggestionItems = page.locator('.suggestion-item');
    
    // Loading states
    this.searchContainer = page.locator('.payee-search');
    this.loadingIndicator = page.locator('button:has-text("Searching...")');
  }

  async navigateToApp() {
    await this.page.goto('http://localhost:5173/');
    await this.page.waitForSelector('.payee-search', { timeout: 10000 });
  }

  async enterSearchTerm(searchTerm) {
    await this.searchInput.clear();
    await this.searchInput.fill(searchTerm);
  }

  async clickSearchButton() {
    await this.searchButton.click();
  }

  async performSearch(searchTerm) {
    await this.enterSearchTerm(searchTerm);
    await this.clickSearchButton();
    // Wait for search to complete by waiting for results or no results message
    await Promise.race([
      this.page.waitForSelector('.payee-list .payee-item', { timeout: 3000 }),
      this.page.waitForSelector('.payee-list-empty', { timeout: 3000 })
    ]).catch(() => {
      // Either results appeared or no results message - both are valid
    });
  }

  async enterTextForSuggestions(inputText) {
    await this.enterSearchTerm(inputText);
    // Wait for suggestions to appear or not appear based on input length
    await this.page.waitForTimeout(400);
  }

  async waitForSearchResults() {
    await this.page.waitForSelector('.payee-list, .payee-list-empty', { timeout: 5000 });
  }

  async getSearchResults() {
    await this.waitForSearchResults();
    return await this.payeeItems.all();
  }

  async getSearchResultsCount() {
    const results = await this.getSearchResults();
    return results.length;
  }

  async getSearchResultData() {
    const payeeItems = await this.getSearchResults();
    const results = [];
    
    for (const item of payeeItems) {
      const displayName = await item.locator('.payee-name').textContent();
      const payId = await item.locator('.payee-payid').textContent();
      results.push({
        displayName: displayName.trim(),
        payId: payId.trim()
      });
    }
    
    return results;
  }

  async isNoResultsMessageVisible() {
    try {
      await this.page.waitForSelector('.payee-list-empty', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getNoResultsMessage() {
    return await this.noResultsMessage.textContent();
  }

  async waitForSuggestionsDropdown() {
    await this.page.waitForSelector('.suggestions-dropdown', { timeout: 3000 });
  }

  async getSuggestions() {
    await this.waitForSuggestionsDropdown();
    return await this.suggestionItems.all();
  }

  async getSuggestionsCount() {
    const suggestions = await this.getSuggestions();
    return suggestions.length;
  }

  async getSuggestionTexts() {
    const suggestionItems = await this.getSuggestions();
    const texts = [];
    
    for (const item of suggestionItems) {
      const text = await item.textContent();
      texts.push(text.trim());
    }
    
    return texts;
  }

  async isSuggestionsDropdownVisible() {
    try {
      await this.waitForSuggestionsDropdown();
      return await this.suggestionsDropdown.isVisible();
    } catch {
      return false;
    }
  }

  async isSuggestionsDropdownHidden() {
    try {
      const isVisible = await this.suggestionsDropdown.isVisible();
      return !isVisible;
    } catch {
      return true;
    }
  }
}

module.exports = { PayeeSearchPage };