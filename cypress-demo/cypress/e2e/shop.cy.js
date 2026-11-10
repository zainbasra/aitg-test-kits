describe('demo shop', () => {
  it('logs in, waits for Add to cart, checks out', () => {
    cy.visit('/');
    cy.get('#user').type('demo');
    cy.get('#pass').type('demo123');
    cy.get('#login-btn').click();
    cy.get('#add', { timeout: 10000 }).should('be.visible').click();
    cy.get('#count').should('have.text', '1');
    cy.get('#checkout').click();
    cy.get('#done').should('be.visible');
  });
  it('rejects bad password', () => {
    cy.visit('/');
    cy.get('#user').type('demo');
    cy.get('#pass').type('wrong');
    cy.get('#login-btn').click();
    cy.get('#msg').should('have.text', 'Invalid credentials');
  });
});
