import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from './supabase';


interface SubCategory {
  id: string;
  name: string;
  category_id: string;
}

interface ProductVariant {
  id: string;
  group_name: string;
  group_type: string;
  value: string;
  price: number;
  images: string[];
}

interface Category {
  id: string;
  name: string;
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  series: string;
  category_id: string;
  sub_category_id: string;
  description: string;
  is_top_seller: boolean;
  base_price: number;
  images: string[];
  categories: { name: string };
  sub_categories?: { name: string };
  product_variants: ProductVariant[];
}

const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [dynamicLimit, setDynamicLimit] = useState<number>(10000);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCatId(categoryFromUrl);
    }

    const fetchData = async () => {
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      const { data: subData } = await supabase.from('sub_categories').select('*').order('name');
      const { data: prodData } = await supabase
        .from('products')
        .select('*, product_variants(*), categories(name), sub_categories(name)')
        .order('created_at', { ascending: false });

      if (catData) setCategories(catData);
      if (subData) setSubCategories(subData);
      if (prodData) {
        setProducts(prodData);
        // Calculate max price from available products
        const highestPrice = prodData.reduce((max, p) => {
          const variantsMax = p.product_variants.length > 0 ? Math.max(...p.product_variants.map((v: any) => v.price || 0)) : 0;
          const pMax = Math.max(variantsMax, p.base_price || 0);
          return pMax > max ? pMax : max;
        }, 1000);
        setDynamicLimit(highestPrice);
        setMinPrice(0);
        setMaxPrice(highestPrice);
      }
      setLoading(false);
    };

    fetchData();
  }, [searchParams]);

  const toggleCategory = (id: string) => {
    setSelectedCatId(prev => prev === id ? null : id);
    setSelectedSubCatId(null); // Clear sub-category filter when changing main category
  };

  const toggleSubCategory = (id: string) => {
    setSelectedSubCatId(prev => prev === id ? null : id);
  };

  const filteredProducts = products
    .filter(p => !selectedCatId || p.category_id === selectedCatId)
    .filter(p => !selectedSubCatId || p.sub_category_id === selectedSubCatId)
    .filter(p => {
       const firstPrice = p.product_variants[0]?.price ?? p.base_price ?? 0;
       return firstPrice >= minPrice && firstPrice <= maxPrice;
    })
    .filter(p => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.series && p.series.toLowerCase().includes(lowerQuery)) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      );
    })
    .sort((a, b) => {
      const aPrice = a.product_variants[0]?.price ?? a.base_price ?? 0;
      const bPrice = b.product_variants[0]?.price ?? b.base_price ?? 0;
      if (sortOrder === 'low-high') {
        return aPrice - bPrice;
      }
      if (sortOrder === 'high-low') {
        return bPrice - aPrice;
      }
      return 0;
    });

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
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className={`story-item ${selectedCatId === cat.id ? 'active' : ''}`}
              onClick={() => toggleCategory(cat.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="story-circle" style={{ border: selectedCatId === cat.id ? '2px solid #aa3bff' : 'none' }}>
                <img src={cat.image_url} alt={cat.name} />
              </div>
              <span>{cat.name}</span>
            </div>
          ))}
          {categories.length === 0 && !loading && (
             <div style={{ color: '#999', fontSize: '0.8rem' }}>No categories configured</div>
          )}
        </div>

        <div className="catalog-content">
          {/* Sidebar */}
          <aside className="catalog-sidebar">
            <div className="filter-group">
              <h3>Availability</h3>
              <div className="filter-option"><input type="checkbox" id="instock" /> <label htmlFor="instock">In stock</label></div>
            </div>
            <div className="filter-group">
              <h3>Price Range</h3>
              <div className="dual-range-container">
                <input 
                  type="range" 
                  min="0" 
                  max={dynamicLimit} 
                  step="100"
                  value={minPrice}
                  className="price-slider min-slider" 
                  onChange={(e) => {
                    const value = Math.min(parseInt(e.target.value), maxPrice - 100);
                    setMinPrice(value);
                  }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max={dynamicLimit} 
                  step="100"
                  value={maxPrice}
                  className="price-slider max-slider" 
                  onChange={(e) => {
                    const value = Math.max(parseInt(e.target.value), minPrice + 100);
                    setMaxPrice(value);
                  }}
                />
                <div 
                  className="slider-track-highlight"
                  style={{
                    left: `${(minPrice / dynamicLimit) * 100}%`,
                    right: `${100 - (maxPrice / dynamicLimit) * 100}%`
                  }}
                ></div>
              </div>
              <div className="price-range">₹ {minPrice.toLocaleString()} — ₹ {maxPrice.toLocaleString()}</div>
            </div>
            <div className="filter-group">
              <h3>Product type</h3>
              {(selectedCatId ? subCategories.filter(sc => sc.category_id === (selectedCatId as any)) : subCategories).map(sub => (
                <div key={sub.id} className="filter-option">
                  <input 
                    type="checkbox" 
                    id={`sub-${sub.id}`} 
                    checked={selectedSubCatId === sub.id}
                    onChange={() => toggleSubCategory(sub.id)}
                  /> 
                  <label htmlFor={`sub-${sub.id}`}>{sub.name}</label>
                </div>
              ))}
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="catalog-main">
             <div className="catalog-sort-bar">
                <div className="product-count">{filteredProducts.length} products</div>
                <div className="catalog-controls">
                  <div className="catalog-search-wrapper">
                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input 
                      type="text" 
                      className="catalog-search-input" 
                      placeholder="Search collection..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="sort-select" 
                    value={sortOrder} 
                    onChange={e => setSortOrder(e.target.value)}
                  >
                     <option value="default">SORT BY</option>
                     <option value="low-high">Price: Low to High</option>
                     <option value="high-low">Price: High to Low</option>
                  </select>
                </div>
             </div>

            {loading ? (
              <div className="loading-state">Loading products...</div>
            ) : (
              <div className="catalog-grid">
                {filteredProducts.map(product => (
                  <Link key={product.id} to={`/product/${product.id}`} className="catalog-product-card-link">
                    <div className="catalog-product-card">
                      <div className="product-card-image">
                        <img src={product.product_variants?.[0]?.images?.[0] || product.images?.[0]} alt={product.name} />
                        {product.is_top_seller && <div className="top-seller-badge">TOP SELLER</div>}
                        <button className="wishlist-btn">♡</button>
                      </div>
                      <div className="product-card-info">
                        <div className="brand-name">ONLYBRASS</div>
                        <h4 className="product-item-name">{product.name}</h4>
                        <div className="product-item-price">
                          {(product.product_variants?.[0]?.price ?? product.base_price) != null ? `₹ ${(product.product_variants[0]?.price ?? product.base_price).toLocaleString()}` : 'Price on Inquiry'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="empty-state">No products found matching your filters.</div>
                )}
              </div>
            )}
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
