import { Routes, Route, Link } from 'react-router-dom';
import CatalogPage from './CatalogPage';
import ProductDetailPage from './ProductDetailPage';
import './index.css';

const HomePage = () => {
  return (
    <div className="HomePage">
      <header className="header">
        <div className="header-logo">
          <Link to="/" className="header-logo-container">
            <img src="/assets/logo.png" alt="ONLYBRASS" className="header-logo-img" />
            <span className="header-logo-text">ONLYBRASS</span>
          </Link>
        </div>
        <nav className="header-nav">
          <a href="#" className="active">Collections</a>
          <a href="#">Bespoke</a>
          <a href="#">Our Story</a>
          <a href="#contact">Contact</a>
        </nav>

      </header>

      <main className="container">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-subtitle">FINE CABINETRY HARDWARE</div>
            <h1 className="hero-title">The Jewelry Box</h1>
            <p className="hero-desc">
              Explore our definitive collection of architectural hardware. Each piece is hand-finished in our atelier, designed to serve as the signature accent for refined interiors.
            </p>
          </div>
          <div className="hero-cta">
            <p className="cta-text">Explore our collection</p>
            <Link to="/catalog" className="btn">View Catalog</Link>
          </div>
        </section>

        <section className="collage-section">
          <img 
            className="collage-img collage-web" 
            src="/assets/web_collage.png" 
            alt="ONLYBRASS Product Features" 
            loading="lazy" 
          />
        </section>

        <section className="top-sellers">
          <div className="top-sellers-header">
            <h2 className="section-title">Top Sellers</h2>
            <Link to="/catalog" className="view-all-link">View All</Link>
          </div>
          <div className="top-sellers-grid">
            {[
              { id: 1, name: 'Oro Handle and Knob', price: '₹ 1,099.00', image: '/assets/oro_knob.png', options: ['28mm / Gold / Brass', '32mm / Gold / Brass'] },
              { id: 2, name: 'Alhambra Knob', price: '₹ 799.00', image: '/assets/alhambra_knob.png', options: ['27mm / Shell White / Acrylic', '30mm / Shell White / Acrylic'] },
              { id: 3, name: 'Regal Gold Knob', price: '₹ 499.00', image: '/assets/regal_knob.png', options: ['20mm / Gold / Brass', '25mm / Gold / Brass'] },
              { id: 4, name: 'Pisa Handle and Knob', price: '₹ 699.00', image: '/assets/pisa_handle.png', options: ['25mm / Gold / Brass', '30mm / Gold / Brass'] }
            ].map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">{product.price}</div>
                  <div className="product-options">
                    <select className="product-select">
                      {product.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bespoke-banner">
          <div className="bespoke-content">
            <h2 className="bespoke-title">Bespoke Finishes</h2>
            <p className="bespoke-desc">
              Beyond our standard collections, we offer a bespoke service for architects and interior designers. Select from over 40 custom finishes to match your project's unique palette.
            </p>
            <a href="#" className="btn">Inquire About Custom</a>
          </div>
          <div className="bespoke-samples">
            <div className="sample-square sample-1"></div>
            <div className="sample-square sample-2"></div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="contact-container">
            <h2 className="contact-title">Contact Us</h2>
            <p className="contact-desc">
              Have a question or looking for a bespoke consultation? We'd love to hear from you.
            </p>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Your Message" rows={5} required></textarea>
              </div>
              <button type="submit" className="btn">Send Inquiry</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer container">
        <div className="footer-copyright">
          © {new Date().getFullYear()} ONLYBRASS ATELIER. ALL RIGHTS RESERVED.
        </div>
        <nav className="footer-nav">
          <a href="#">Contact</a>
          <a href="#">Press</a>
          <a href="#">Instagram</a>
          <a href="#">Pinterest</a>
        </nav>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
    </Routes>
  );
}

export default App;
