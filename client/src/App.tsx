import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CatalogPage from './CatalogPage';
import ProductDetailPage from './ProductDetailPage';
import { supabase } from './supabase';
import './index.css';

interface ProductVariant {
  id: string;
  group_name: string;
  group_type: string;
  value: string;
  price: number;
  images: string[];
}

interface Product {
  id: string;
  name: string;
  series: string;
  is_top_seller: boolean;
  base_price: number;
  images: string[];
  product_variants: ProductVariant[];
}

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topSellers, setTopSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      const { data: prodData } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('is_top_seller', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (catData) setCategories(catData);
      if (prodData) setTopSellers(prodData);
      setLoading(false);
    };

    fetchData();
  }, []);

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
          <Link to="/catalog">Collections</Link>
          <a href="#top-sellers">Top Sellers</a>
          <a href="#our-story">Our Story</a>
          <a href="#contact">Contact</a>
        </nav>

      </header>

      <main className="container">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-subtitle">FINE CABINETRY HARDWARE</div>
            <h1 className="hero-title">The Jewelry Box</h1>
            
            <div className="hero-interaction">
              <div className="category-nav-inline">
                <div className="story-bar">
                  {loading ? (
                    <div className="loading-dots">...</div>
                  ) : (
                    categories.map((cat) => (
                      <Link key={cat.id} to={`/catalog?category=${cat.id}`} className="story-item">
                        <div className="story-circle">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} />
                          ) : (
                            <div className="placeholder"></div>
                          )}
                        </div>
                        <span>{cat.name}</span>
                      </Link>
                    ))
                  )}
                  
                  {/* Fallback if no categories exist in DB yet */}
                  {!loading && categories.length === 0 && (
                    <>
                      <Link to="/catalog" className="story-item">
                        <div className="story-circle-placeholder"></div>
                        <span>Loading...</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <div className="hero-cta">
                <p className="cta-text">Explore our collection</p>
                <Link to="/catalog" className="btn">View Catalog</Link>
              </div>
            </div>
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

        <section id="top-sellers" className="top-sellers">
          <div className="top-sellers-header">
            <h2 className="section-title">Top Sellers</h2>
            <Link to="/catalog" className="view-all-link">View All</Link>
          </div>
          <div className="top-sellers-grid">
            {topSellers.map(product => {
              const mainVariant = product.product_variants?.[0];
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={mainVariant?.images?.[0] || product.images?.[0]} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">
                       {(mainVariant?.price ?? product.base_price) != null 
                         ? `₹ ${(mainVariant?.price ?? product.base_price).toLocaleString()}` 
                         : 'Price on Inquiry'}
                    </div>
                    <div className="product-options">
                      <select className="product-select">
                        {product.product_variants?.map(v => (
                          <option key={v.id}>{v.group_name}: {v.value}</option>
                        ))}
                      </select>
                    </div>
                    <Link to={`/product/${product.id}`} className="add-to-cart-btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
            {!loading && topSellers.length === 0 && (
              <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '3rem', color: '#999' }}>
                No top sellers currently featured.
              </div>
            )}
          </div>
        </section>

        <section id="our-story" className="bespoke-banner">
          <div className="bespoke-content">
            <h2 className="bespoke-title">Our Story</h2>
            <p className="bespoke-desc">
              OnlyBrass was born from a passion for timeless craftsmanship. We believe that hardware is the jewelry of the home—the final, defining touch that turns a house into a sanctuary of style. Every piece in our collection is a testament to the enduring beauty of solid brass, hand-finished to perfection for those who appreciate the finer details of living.
            </p>
            <Link to="/catalog" className="btn">Explore The Collection</Link>
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
