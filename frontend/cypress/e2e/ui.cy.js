describe('Global UI Interactions', () => {
  it('should toggle dark mode', () => {
    cy.clearLocalStorage();
    
    // Visit with mocked media query for light mode
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win, 'matchMedia').returns({
          matches: false // Force light mode default
        });
      }
    });
    
    // Check initial state (default should be light)
    cy.get('html').should('not.have.class', 'dark');

    // Click the moon icon to toggle to dark mode
    cy.get('button[title="Switch to Dark Mode"]').click();

    // Verify dark mode class was added
    cy.get('html').should('have.class', 'dark');
    
    // Verify the button title updated
    cy.get('button[title="Switch to Light Mode"]').should('be.visible');
    
    // Check local storage uses 'darkMode' and is string 'true'
    cy.window().its('localStorage.darkMode').should('eq', 'true');
  });
});
