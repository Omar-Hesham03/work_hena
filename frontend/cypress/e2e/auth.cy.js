describe('Authentication UI', () => {
  it('should successfully fill out the registration form and see the banner', () => {
    // Stub the backend API to avoid rate limiting and polluting DB
    cy.intercept('POST', 'http://localhost:5000/api/auth/register', {
      statusCode: 201,
      body: {
        message: 'User registered successfully',
        token: 'fake-jwt-token',
        user: { 
          id: 999, 
          email: 'cypress@workhena.com', 
          full_name: 'Cypress Test User', 
          user_type: 'job_seeker', 
          email_verified: false 
        }
      }
    }).as('registerUser');

    cy.visit('/register');
    
    // Fill out form
    cy.get('input[name="full_name"]').type('Cypress Test User');
    cy.get('input[name="email"]').type('cypress@workhena.com');
    cy.get('input[name="password"]').type('StrongPass123!');
    
    // Submit
    cy.get('button[type="submit"]').click();

    // Wait for the mock API call
    cy.wait('@registerUser');

    // Should redirect to home (since user state is now stored in local storage)
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // The Verification Banner should be visible on the home page!
    cy.contains('Please verify your email address').should('be.visible');
  });
});
