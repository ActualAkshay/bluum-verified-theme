/** Shared support section. SMS opens the existing support channel, not a simulated chat. */
export const VerifiedSupport = () => (
  <section className="verified-support" aria-label="Customer support">
    <div>
      <h2>Need help? Our<br />team is here.</h2>
      <p>Get fast support with orders, shipping, or lab documentation.</p>
      <a href="sms:+16283037232" className="verified-button">Text Us</a>
    </div>
    <div className="verified-chat" aria-label="Example customer support conversation">
      <span>Hi, I have a question about my order</span>
      <span>Hi! How can we help?</span>
      <span>Write the # of your order</span>
    </div>
  </section>
)
