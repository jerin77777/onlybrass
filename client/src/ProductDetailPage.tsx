import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from './supabase';

interface Variant {
  name: string;
  values: string[];
}

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
  description: string;
  is_top_seller: boolean;
  base_price: number;
  images: string[];
  categories: { name: string };
  sub_categories?: { name: string };
  product_variants: ProductVariant[];
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*), categories(name), sub_categories(name)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
      } else if (data) {
        setProduct(data);
        // Set initial variant and default image
        if (data.product_variants && data.product_variants.length > 0) {
          setSelectedVariant(data.product_variants[0]);
          setActiveImage(data.product_variants[0].images?.[0] || data.images?.[0]);
        } else {
          setActiveImage(data.images?.[0]);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleVariantClick = (v: ProductVariant) => {
    setSelectedVariant(v);
    if (v.images && v.images.length > 0) {
      setActiveImage(v.images[0]);
    }
  };

  if (loading) return <div className="PDP">Loading product details...</div>;
  if (!product) return <div className="PDP">Product not found.</div>;

  // Combine product images and selected variant images for the gallery
  const allImages = Array.from(new Set([
    ...(product.images || []),
    ...(selectedVariant?.images || [])
  ])).filter(Boolean);

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
        <nav className="breadcrumbs">
          <Link to="/catalog">COLLECTIONS</Link> 
          <span className="separator">›</span> 
          <span>{(product as any).categories?.name?.toUpperCase() || 'COLLECTION'}</span> 
          <span className="separator">›</span> 
          <span className="current">{product.name.toUpperCase()}</span>
        </nav>

        <div className="pdp-layout">
          <section className="pdp-gallery">
            <div className="pdp-gallery-main">
              <img src={activeImage || '/assets/placeholder.png'} alt={product.name} />
            </div>
            
            {allImages.length > 1 && (
              <div className="pdp-thumbnails">
                {allImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumb-item ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="pdp-info">
            <div className="pdp-header">
              <span className="series-name">{product.series}</span>
              <h1 className="product-title">{product.name}</h1>
            </div>

            <p className="product-description">{product.description}</p>

            {product.product_variants && product.product_variants.length > 0 && (
              <div className="finish-selection">
                {Object.entries(
                  product.product_variants.reduce((acc, v) => {
                    if (!acc[v.group_name]) acc[v.group_name] = [];
                    acc[v.group_name].push(v);
                    return acc;
                  }, {} as Record<string, ProductVariant[]>)
                ).map(([groupName, variants], i) => (
                  <div key={i} style={{marginBottom: '1.5rem'}}>
                    <h3 className="section-subtitle">{groupName.toUpperCase()}</h3>
                    <div className="variant-options">
                      {variants.map((v, j) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <div 
                            key={j} 
                            className={`option-tag ${isSelected ? 'active' : ''}`} 
                            onClick={() => handleVariantClick(v)}
                          >
                            {v.group_type === 'color' && (
                              <div className="color-dot" style={{ background: v.value }}></div>
                            )}
                            {v.value}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="technical-specs">
               <div className="spec-item">
                  <span className="spec-label">PRICE</span>
                  <span className="spec-value">
                    {(selectedVariant?.price ?? product.base_price) != null 
                      ? `₹ ${(selectedVariant?.price ?? product.base_price).toLocaleString()}` 
                      : 'Price on Inquiry'}
                  </span>
               </div>
               <div className="spec-item">
                  <span className="spec-label">CATEGORY</span>
                  <span className="spec-value">{(product as any).categories?.name || '-'}</span>
               </div>
               {(product as any).sub_categories?.name && (
                 <div className="spec-item">
                    <span className="spec-label">SUB-CATEGORY</span>
                    <span className="spec-value">{(product as any).sub_categories?.name}</span>
                 </div>
               )}
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
