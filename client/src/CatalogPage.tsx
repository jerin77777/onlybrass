import React from 'react';
import { Link } from 'react-router-dom';

const CatalogPage = () => {
  const products = [
    { id: 1, name: 'Urbane Bar Handle', brand: 'ONLYBRASS', price: '₹ 849.00 - ₹ 1,399.00', image: '/assets/bundle/urbane_handle.png', colors: ['#000', '#b3885d'] },
    { id: 2, name: 'Empire Handle and Knob', brand: 'ONLYBRASS', price: '₹ 499.00 - ₹ 799.00', image: '/assets/bundle/empire_handle.png', colors: ['#fff', '#b3885d'] },
    { id: 3, name: 'Mirabella Handle', brand: 'ONLYBRASS', price: '₹ 699.00 - ₹ 1,849.00', image: '/assets/bundle/mirabella_handle.png', colors: ['#b3885d'] },
    { id: 4, name: 'Cleo T Bar Handle', brand: 'ONLYBRASS', price: '₹ 799.00 - ₹ 2,149.00', image: '/assets/bundle/cleo_handle.png', colors: ['#000', '#b3885d'] },
    { id: 5, name: 'Maverick Pull Knob', brand: 'ONLYBRASS', price: '₹ 899.00', image: '/assets/bundle/maverick_knob.png', colors: ['#000', '#b3885d'] },
    { id: 6, name: 'Sydney Handle', brand: 'ONLYBRASS', price: '₹ 999.00 - ₹ 5,099.00', image: '/assets/bundle/sydney_handle.png', colors: ['#000'] },
  ];

  return (
    <div className="CatalogPage">
      <header className="header">
        <div className="header-logo">
          <Link to="/" className="header-logo-container">
            <img src="/assets/logo.png" alt="ONLYBRASS" className="header-logo-img" />
            <span className="header-logo-text">ONLYBRASS</span>
          </Link>
        </div>

      </header>

      <main className="catalog-container">
        <h1 className="catalog-title">Explore The Bundle</h1>
        
        {/* Story Bar */}
        <div className="story-bar">
          <div className="story-item">
            <div className="story-circle"><img src="/assets/bundle/story_1.png" alt="Explore Now" /></div>
            <span>Explore Now</span>
          </div>
          <div className="story-item">
            <div className="story-circle"><img src="/assets/bundle/story_2.png" alt="New Collections" /></div>
            <span>New Collections</span>
          </div>
          <div className="story-item">
            <div className="story-circle"><img src="/assets/bundle/story_3.png" alt="Testimonial" /></div>
            <span>Testimonial</span>
          </div>
          {/* Add more story items as placeholders to match the reference */}
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="story-item">
                <div className="story-circle placeholder"></div>
                <span>testimonial</span>
             </div>
          ))}
        </div>

        <div className="catalog-content">
          {/* Sidebar Filters */}
          <aside className="catalog-sidebar">
            <div className="filter-group">
              <h3>Availability</h3>
              <div className="filter-option"><input type="checkbox" id="instock" /> <label htmlFor="instock">In stock (94)</label></div>
              <div className="filter-option"><input type="checkbox" id="outofstock" /> <label htmlFor="outofstock">Out of stock (1)</label></div>
            </div>

            <div className="filter-group">
              <h3>Price</h3>
              <input type="range" min="0" max="7799" className="price-slider" />
              <div className="price-range">Price: ₹ 0 — ₹ 7,799</div>
            </div>

            <div className="filter-group">
              <h3>Product type</h3>
              <div className="filter-option"><input type="checkbox" id="handles" /> <label htmlFor="handles">Handles (84)</label></div>
              <div className="filter-option"><input type="checkbox" id="knobs" /> <label htmlFor="knobs">Knob (45)</label></div>
            </div>

            <div className="filter-group">
              <h3>Material</h3>
              <div className="filter-option"><input type="checkbox" id="alum" /> <label htmlFor="alum">Aluminium (1)</label></div>
              <div className="filter-option"><input type="checkbox" id="brass" /> <label htmlFor="brass">Brass (90)</label></div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="catalog-main">
            <div className="catalog-sort-bar">
               <div className="product-count">94 products</div>
               <select className="sort-select">
                  <option>SORT BY</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
               </select>
            </div>

            <div className="catalog-grid">
              {products.map(product => (
                <Link key={product.id} to="/product/aethelred" className="catalog-product-card-link">
                  <div className="catalog-product-card">
                    <div className="product-card-image">
                      <img src={product.image} alt={product.name} />
                      <button className="wishlist-btn">♡</button>
                    </div>
                    <div className="product-card-info">
                      <div className="brand-name">{product.brand}</div>
                      <h4 className="product-item-name">{product.name}</h4>
                      <div className="product-item-price">{product.price}</div>
                      <div className="color-swatches">
                        {product.colors.map((c, i) => (
                          <div key={i} className="color-dot" style={{ backgroundColor: c }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
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

export default CatalogPage;
