import React, { useState } from 'react';
import './Admin.css';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  name: string;
  values: string[];
}

interface Product {
  id: string;
  name: string;
  series: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string;
  isTopSeller: boolean;
  variants: Variant[];
}

function App() {
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('products');
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'The Artisan Series', slug: 'artisan-series' },
    { id: '2', name: 'Standard Collections', slug: 'collections' }
  ]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Category Form State
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodSeries, setProdSeries] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodTopSeller, setProdTopSeller] = useState(false);
  const [prodVariants, setProdVariants] = useState<Variant[]>([]);

  // Variant Helper
  const addVariantGroup = () => {
    setProdVariants([...prodVariants, { name: '', values: [] }]);
  };

  const updateVariantName = (index: number, name: string) => {
    const next = [...prodVariants];
    next[index].name = name;
    setProdVariants(next);
  };

  const addVariantValue = (index: number, val: string) => {
    if (!val) return;
    const next = [...prodVariants];
    next[index].values.push(val);
    setProdVariants(next);
  };

  const removeVariantValue = (gIndex: number, vIndex: number) => {
    const next = [...prodVariants];
    next[gIndex].values.splice(vIndex, 1);
    setProdVariants(next);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat = { id: Date.now().toString(), name: catName, slug: catSlug };
    setCategories([...categories, newCat]);
    setCatName(''); setCatSlug('');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProd = {
      id: Date.now().toString(),
      name: prodName,
      series: prodSeries,
      category: prodCat,
      description: prodDesc,
      price: prodPrice,
      imageUrl: prodImage,
      isTopSeller: prodTopSeller,
      variants: prodVariants
    };
    setProducts([...products, newProd]);
    // Reset
    setProdName(''); setProdSeries(''); setProdDesc(''); setProdPrice(''); setProdVariants([]);
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src="/assets/logo.png" alt="ONLYBRASS" style={{ height: '30px', width: 'auto' }} />
        </div>
        <nav className="admin-nav">
          <div 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </div>
          <div 
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'categories' ? (
          <div className="view-categories">
            <header className="admin-header">
              <h2>Category Management</h2>
            </header>
            
            <section className="admin-card">
              <h3>Add New Category</h3>
              <form onSubmit={handleAddCategory} className="form-grid">
                <div className="form-group">
                  <label>Category Name</label>
                  <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Bespoke Finishes" required />
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input value={catSlug} onChange={e => setCatSlug(e.target.value)} placeholder="e.g. bespoke" required />
                </div>
                <button type="submit" className="admin-btn btn-primary">Save Category</button>
              </form>
            </section>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td><code>{c.slug}</code></td>
                    <td>{c.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="view-products">
            <header className="admin-header">
              <h2>Product Management</h2>
            </header>

            <section className="admin-card">
              <h3>Add New Product</h3>
              <form onSubmit={handleAddProduct}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input value={prodName} onChange={e => setProdName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Series</label>
                    <input value={prodSeries} onChange={e => setProdSeries(e.target.value)} placeholder="e.g. Artisan Signature" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={prodCat} onChange={e => setProdCat(e.target.value)} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Base Price / Range</label>
                    <input value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="₹ 0.00" />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} rows={3}></textarea>
                  </div>
                  <div className="form-group">
                    <label>Image Path</label>
                    <input value={prodImage} onChange={e => setProdImage(e.target.value)} placeholder="/assets/..." />
                  </div>
                  <div className="form-group">
                    <label>Is Top Seller?</label>
                    <input type="checkbox" checked={prodTopSeller} onChange={e => setProdTopSeller(e.target.checked)} />
                  </div>
                </div>

                <div className="variants-section">
                  <div className="variant-header">
                    <h4>Variants (Size, Finish, Color)</h4>
                    <button type="button" onClick={addVariantGroup} className="admin-btn btn-secondary">+ Add Variant Group</button>
                  </div>
                  
                  {prodVariants.map((group, gIndex) => (
                    <div key={gIndex} className="variant-group">
                      <div className="form-group">
                        <label>Variant Name (e.g. Size)</label>
                        <input value={group.name} onChange={e => updateVariantName(gIndex, e.target.value)} placeholder="Size / Finish" />
                      </div>
                      <div style={{marginTop: '1rem'}}>
                        <label style={{fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem'}}>Values</label>
                        <div className="variant-values">
                          {group.values.map((v, vIndex) => (
                            <div key={vIndex} className="value-tag">
                              {v} <span className="remove-action" onClick={() => removeVariantValue(gIndex, vIndex)}>×</span>
                            </div>
                          ))}
                        </div>
                        <input 
                          type="text" 
                          placeholder="Type value and press enter" 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addVariantValue(gIndex, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button type="submit" className="admin-btn btn-primary" style={{marginTop: '2rem'}}>Save Product</button>
              </form>
            </section>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Variants</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong><br/>
                      <small>{p.series}</small>
                    </td>
                    <td><code>{p.category}</code></td>
                    <td>{p.price}</td>
                    <td>{p.variants.length} types</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
