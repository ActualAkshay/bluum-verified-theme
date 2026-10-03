/** Shared support section. SMS opens the existing support channel, not a simulated chat. */
export const VerifiedSupport = () => (
  <section className="verified-support" aria-label="Customer support">
    <div className="verified-support-copy">
      <h2><em>Need help?</em> Our<br />team is here.</h2>
      <p>Get fast support with orders, shipping, or lab documentation.</p>
      <a href="sms:+16283037232" className="verified-button">Text Us</a>
    </div>
    <div className="verified-chat" aria-label="Example customer support conversation">
      <div className="verified-chat-group verified-chat-group--client">
        <span className="verified-chat-sender">Client</span>
        <span className="verified-chat-bubble">Hi, I have a question about my order</span>
      </div>
      <div className="verified-chat-group verified-chat-group--support">
        <span className="verified-chat-sender">Bluum Client Support</span>
        <span className="verified-chat-bubble">Hi! How can we help?</span>
        <span className="verified-chat-bubble">Write the # of your order</span>
      </div>
    </div>
  </section>
)
