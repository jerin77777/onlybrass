import { Link } from 'react-router-dom';

const ProductDetailPage = () => {

  // For current demo purposes, we define the Aethelred data here
  const product = {
    name: "Aethelred Handle",
    series: "ARTISAN SIGNATURE SERIES",
    description: "A masterclass in tactile contrast. Hand-forged solid brass meets the ethereal luminescence of responsibly sourced Mother of Pearl.",
    finishes: [
      { id: 'brass', name: 'ANTIQUE BRASS', color: '#b3885d' },
      { id: 'nickel', name: 'SATIN NICKEL', color: '#c0c0c0' }
    ],
    details: [
      { label: "MATERIAL", value: "Solid Brass / MOP Inlay" },
      { label: "DIMENSIONS", value: "L 165mm x H 22mm x P 55mm" },
      { label: "WEIGHT", value: "0.85 kg / Unit" },
      { label: "MOUNTING", value: "Concealed Screws" }
    ]
  };

  return (
    <div className="PDP">
      <header className="header">
        <div className="header-logo">
          <Link to="/" className="header-logo-container">
            <img src="/assets/logo.png" alt="ONLYBRASS" className="header-logo-img" />
            <span className="header-logo-text">ONLYBRASS</span>
          </Link>
        </div>

      </header>

      <main className="pdp-container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/catalog">COLLECTIONS</Link> 
          <span className="separator">›</span> 
          <span>THE ARTISAN SERIES</span> 
          <span className="separator">›</span> 
          <span className="current">{product.name.toUpperCase()}</span>
        </nav>

        <div className="pdp-layout">
          {/* Left Column: Gallery */}
          <section className="pdp-gallery">
            <div className="main-image-placeholder">
              {/* This would be /assets/aethelred_main.png */}
              <div className="placeholder-text">AETHELRED MAIN IMAGE</div>
            </div>
            <div className="pdp-thumbnails">
              <div className="thumb-placeholder"><div className="placeholder-text">THUMB 1</div></div>
              <div className="thumb-placeholder"><div className="placeholder-text">THUMB 2</div></div>
            </div>
          </section>

          {/* Right Column: Info */}
          <section className="pdp-info">
            <div className="pdp-header">
              <span className="series-name">{product.series}</span>
              <h1 className="product-title">{product.name}</h1>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="finish-selection">
              <h3 className="section-subtitle">SELECT FINISH</h3>
              <div className="finish-swatches">
                {product.finishes.map(finish => (
                  <div key={finish.id} className="finish-card">
                    <div className="swatch-preview" style={{ backgroundColor: finish.color }}></div>
                    <span className="finish-name">{finish.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="technical-specs">
              {product.details.map((detail, index) => (
                <div key={index} className="spec-item">
                  <span className="spec-label">{detail.label}</span>
                  <span className="spec-value">{detail.value}</span>
                </div>
              ))}
            </div>

            <div className="pdp-actions">
              <button className="btn btn-primary">REQUEST ATELIER QUOTE</button>
              <button className="btn btn-secondary">FIND A REGIONAL DEALER</button>
            </div>

            <div className="lifetime-guarantee">
              <span className="shield-icon">🛡️</span>
              <span className="guarantee-text">LIFETIME STRUCTURAL GUARANTEE</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer container">
        <div className="footer-copyright">
          © {new Date().getFullYear()} ONLYBRASS ATELIER. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailPage;
