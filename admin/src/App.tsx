import React, { useState, useEffect, useRef } from 'react';
import './Admin.css';
import { supabase } from './supabase';

interface Category {
  id: string;
  name: string;
  image_url: string;
}

interface SubCategory {
  id: string;
  name: string;
  category_id: string;
}

interface VariantValue {
  value: string;
  price: string;
  images: string[];
  image_files?: File[];
}

interface Variant {
  name: string;
  type: 'standard' | 'color';
  values: VariantValue[];
}

interface Product {
  id: string;
  name: string;
  series: string;
  category_id: string;
  sub_category_id: string;
  description: string;
  is_top_seller: boolean;
  base_price?: number;
  images?: string[];
  product_variants: Array<{
    id: string;
    group_name: string;
    group_type: string;
    value: string;
    price: number;
    images: string[];
  }>;
  created_at: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubCatModalOpen, setIsSubCatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catImageFile, setCatImageFile] = useState<File | null>(null);
  const [existingCatImageUrl, setExistingCatImageUrl] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Sub-Category Form State
  const [subCatName, setSubCatName] = useState('');
  const [subCatParentId, setSubCatParentId] = useState('');
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodSeries, setProdSeries] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodSubCatId, setProdSubCatId] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodBasePrice, setProdBasePrice] = useState('');
  const [prodImages, setProdImages] = useState<File[]>([]);
  const [existingProdImages, setExistingProdImages] = useState<string[]>([]);
  const [prodTopSeller, setProdTopSeller] = useState(false);
  const [prodVariants, setProdVariants] = useState<Variant[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Dropdown States
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const catDropdownRef = useRef<HTMLDivElement>(null);

  const [isSubCatDropdownOpen, setIsSubCatDropdownOpen] = useState(false);
  const [subCatSearchQuery, setSubCatSearchQuery] = useState('');
  const subCatDropdownRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (subCatDropdownRef.current && !subCatDropdownRef.current.contains(event.target as Node)) {
        setIsSubCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*), categories(name), sub_categories(name)')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
  };

  const fetchInitialData = async () => {
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    const { data: subCatData } = await supabase.from('sub_categories').select('*').order('name');
    
    if (catData) setCategories(catData);
    if (subCatData) setSubCategories(subCatData);
    await fetchProducts();
    
    if (catData && catData.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(catData[0].id);
    }
  };

  // Helper: Image Upload
  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${folder}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };
  
  const extractStoragePath = (url: string): string | null => {
    try {
      // Url format: .../storage/v1/object/public/images/products/...
      const marker = '/storage/v1/object/public/images/';
      const index = url.indexOf(marker);
      if (index === -1) return null;
      return url.substring(index + marker.length);
    } catch (e) {
      console.error('Path extraction error:', e);
      return null;
    }
  };

  // Variant Helpers
  const resetCategoryForm = () => {
    setCatName('');
    setCatImageFile(null);
    setExistingCatImageUrl(null);
    setEditingCategoryId(null);
  };

  const resetSubCategoryForm = () => {
    setSubCatName('');
    setSubCatParentId('');
    setEditingSubCategoryId(null);
  };

  const resetProductForm = () => {
    setProdName('');
    setProdSeries('');
    setProdCatId('');
    setProdSubCatId('');
    setProdDesc('');
    setProdBasePrice('');
    setProdImages([]);
    setExistingProdImages([]);
    setProdTopSeller(false);
    setProdVariants([]);
    setEditingProductId(null);
  };

  const handleEditOpen = (product: Product) => {
    setProdName(product.name);
    setProdSeries(product.series || '');
    setProdCatId(product.category_id || '');
    setProdSubCatId(product.sub_category_id || '');
    setProdDesc(product.description || '');
    setProdBasePrice(product.base_price ? product.base_price.toString() : '');
    setProdTopSeller(product.is_top_seller);
    setExistingProdImages(product.images || []);
    
    // Group variants by group_name to rebuild the prodVariants structure
    const groups: { [key: string]: Variant } = {};
    product.product_variants.forEach(v => {
      if (!groups[v.group_name]) {
        groups[v.group_name] = {
          name: v.group_name,
          type: (v.group_type as 'standard' | 'color'),
          values: []
        };
      }
      groups[v.group_name].values.push({
        value: v.value,
        price: v.price ? v.price.toString() : '',
        images: v.images || [],
        image_files: []
      });
    });
    
    setProdVariants(Object.values(groups));
    setEditingProductId(product.id);
    setIsProdModalOpen(true);
  };

  const addVariantGroup = () => setProdVariants([...prodVariants, { name: '', type: 'standard', values: [{ value: '', price: '', images: [], image_files: [] }] }]);
  const updateVariantName = (index: number, name: string) => {
    const next = [...prodVariants];
    next[index].name = name;
    setProdVariants(next);
  };
  const updateVariantType = (index: number, type: 'standard' | 'color') => {
    const next = [...prodVariants];
    next[index].type = type;
    setProdVariants(next);
  };
  const addVariantValue = (index: number) => {
    const next = [...prodVariants];
    next[index].values.push({ value: '', price: '', images: [], image_files: [] });
    setProdVariants(next);
  };
  const updateVariantValueField = (gIndex: number, vIndex: number, field: keyof VariantValue, val: any) => {
    const next = [...prodVariants];
    (next[gIndex].values[vIndex] as any)[field] = val;
    setProdVariants(next);
  };
  const removeVariantValue = (gIndex: number, vIndex: number) => {
    const next = [...prodVariants];
    next[gIndex].values.splice(vIndex, 1);
    setProdVariants(next);
  };
  const removeVariantGroup = (index: number) => {
    const next = [...prodVariants];
    next.splice(index, 1);
    setProdVariants(next);
  };
  
  const removeCommonExistingImage = (imgUrl: string) => {
    setExistingProdImages(existingProdImages.filter(url => url !== imgUrl));
  };
  
  const removeCommonNewImage = (index: number) => {
    const next = [...prodImages];
    next.splice(index, 1);
    setProdImages(next);
  };
  
  const removeVariantExistingImage = (gIndex: number, vIndex: number, imgUrl: string) => {
    const next = [...prodVariants];
    next[gIndex].values[vIndex].images = next[gIndex].values[vIndex].images.filter(url => url !== imgUrl);
    setProdVariants(next);
  };
  
  const removeVariantNewImage = (gIndex: number, vIndex: number, fIndex: number) => {
    const next = [...prodVariants];
    const files = next[gIndex].values[vIndex].image_files || [];
    const nextFiles = [...files];
    nextFiles.splice(fIndex, 1);
    next[gIndex].values[vIndex].image_files = nextFiles;
    setProdVariants(next);
  };

  const handleEditCategoryOpen = (cat: Category) => {
    setCatName(cat.name);
    setExistingCatImageUrl(cat.image_url);
    setEditingCategoryId(cat.id);
    setIsCatModalOpen(true);
  };

  const handleEditSubCategoryOpen = (sub: SubCategory) => {
    setSubCatName(sub.name);
    setSubCatParentId(sub.category_id);
    setEditingSubCategoryId(sub.id);
    setIsSubCatModalOpen(true);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catImageFile && !editingCategoryId) return alert('Please select a category image');
    
    setIsUploading(true);
    try {
      let image_url = existingCatImageUrl;
      if (catImageFile) {
        image_url = await uploadImage(catImageFile, 'categories');
      }

      if (editingCategoryId) {
        const { error } = await supabase
          .from('categories')
          .update({ name: catName, image_url })
          .eq('id', editingCategoryId);
        if (error) throw error;
        setCategories(categories.map(c => c.id === editingCategoryId ? { ...c, name: catName, image_url: image_url! } : c));
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name: catName, image_url }])
          .select();
        if (error) throw error;
        if (data) setCategories([...categories, data[0] as Category]);
      }
      
      resetCategoryForm();
      setIsCatModalOpen(false);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save category");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const parentId = subCatParentId || (editingSubCategoryId ? subCatParentId : selectedCategoryId);
    if (!parentId) return alert('Please select a parent category');
    
    try {
      if (editingSubCategoryId) {
        const { error } = await supabase
          .from('sub_categories')
          .update({ name: subCatName, category_id: parentId })
          .eq('id', editingSubCategoryId);
        if (error) throw error;
        setSubCategories(subCategories.map(sc => sc.id === editingSubCategoryId ? { ...sc, name: subCatName, category_id: parentId } : sc));
      } else {
        const { data, error } = await supabase
          .from('sub_categories')
          .insert([{ name: subCatName, category_id: parentId }])
          .select();
        if (error) throw error;
        if (data) setSubCategories([...subCategories, data[0] as SubCategory]);
      }
      
      resetSubCategoryForm();
      setIsSubCatModalOpen(false);
    } catch (error) {
      alert("Failed to save sub-category");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prodCatId) return alert('Please select a Category');
    if (!prodSubCatId) return alert('Please select a Sub-Category');
    
    setIsUploading(true);

    try {
      // Upload product common images
      const finalCommonImages: string[] = [...existingProdImages];
      for (const file of prodImages) {
        const url = await uploadImage(file, 'products');
        finalCommonImages.push(url);
      }

      // 1. Insert or Update core product
      let productId = editingProductId;
      
      if (editingProductId) {
        const { error: productError } = await supabase
          .from('products')
          .update({
            name: prodName,
            series: prodSeries,
            category_id: prodCatId || null,
            sub_category_id: prodSubCatId || null,
            description: prodDesc,
            base_price: prodBasePrice ? parseFloat(prodBasePrice) : null,
            images: finalCommonImages,
            is_top_seller: prodTopSeller
          })
          .eq('id', editingProductId);
          
        if (productError) throw productError;
        
        // Delete all old variants for syncing
        const { error: deleteError } = await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', editingProductId);
          
        if (deleteError) throw deleteError;
      } else {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .insert([{
            name: prodName,
            series: prodSeries,
            category_id: prodCatId || null,
            sub_category_id: prodSubCatId || null,
            description: prodDesc,
            base_price: prodBasePrice ? parseFloat(prodBasePrice) : null,
            images: finalCommonImages,
            is_top_seller: prodTopSeller
          }])
          .select()
          .single();

        if (productError) throw productError;
        productId = productData.id;
      }

      // 2. Process Variants and their images
      for (const group of prodVariants) {
        for (const value of group.values) {
          let variantImages = [...(value.images || [])];

          // Upload image if present
          if (value.image_files && value.image_files.length > 0) {
             for (const file of value.image_files) {
               const url = await uploadImage(file, 'products');
               variantImages.push(url);
             }
          }

          // Insert variant row
          const finalPrice = value.price ? parseFloat(value.price) : null;
          const { error: variantError } = await supabase
            .from('product_variants')
            .insert([{
              product_id: productId,
              group_name: group.name,
              group_type: group.type,
              value: value.value,
              price: finalPrice,
              images: variantImages
            }]);

          if (variantError) console.error('Variant insert error:', variantError);
        }
      }

      setIsProdModalOpen(false);
      resetProductForm();
      await fetchProducts();
    } catch (err: any) {
      console.error("Save failed", err);
      alert('Error saving product: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? This will also delete all its sub-categories.`)) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== id));
      setSubCategories(subCategories.filter(sc => sc.category_id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete category");
    }
  };

  const handleDeleteSubCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('sub_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubCategories(subCategories.filter(sc => sc.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete sub-category");
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      // 1. Collect all images to delete from storage
      const imageUrls = new Set<string>();
      if (product.images) product.images.forEach(url => imageUrls.add(url));
      if (product.product_variants) {
        product.product_variants.forEach(v => {
          if (v.images) v.images.forEach(url => imageUrls.add(url));
        });
      }
      
      const storagePaths = Array.from(imageUrls)
        .map(url => extractStoragePath(url))
        .filter((path): path is string => !!path);

      // 2. Delete database record (Variants are cascaded)
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (dbError) throw dbError;
      
      // 3. Clear from state
      setProducts(products.filter(p => p.id !== product.id));
      setDeletingProduct(null);

      // 4. Delete images from storage (non-blocking errors)
      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove(storagePaths);
        
        if (storageError) {
          console.warn('Image cleanup error (non-critical):', storageError);
        }
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/assets/logo.png" alt="ONLYBRASS" style={{ height: '30px', width: 'auto' }} />
          <span style={{ fontSize: '1.2rem', letterSpacing: '0.1em' }}>ONLYBRASS</span>
        </div>
        <nav className="admin-nav">
          <div className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</div>
          <div className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories</div>
        </nav>
      </aside>

      <main className="admin-main">
        {activeTab === 'categories' ? (
          <div className="view-categories">
            <header className="admin-header"><h2>Category Management</h2></header>
            <div className="categories-container">
              <div className="categories-column">
                <div className="column-header">
                  <h3>All Categories</h3>
                  <button className="btn-add-circle" onClick={() => { resetCategoryForm(); setIsCatModalOpen(true); }} title="Add Category">+</button>
                </div>
                <div className="admin-card" style={{padding: '0'}}>
                  <table className="admin-table">
                    <thead><tr><th>Image</th><th>Name</th><th className="action-cell"></th></tr></thead>
                    <tbody>
                      {categories.map(c => (
                        <tr key={c.id} className={`selectable-row ${selectedCategoryId === c.id ? 'active' : ''}`} onClick={() => setSelectedCategoryId(c.id)}>
                          <td onClick={() => handleEditCategoryOpen(c)}><img src={c.image_url} alt={c.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                          <td onClick={() => handleEditCategoryOpen(c)} style={{ flex: 1 }}>{c.name}</td>
                          <td className="action-cell">
                            <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id, c.name); }} title="Delete Category">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="sub-categories-column">
                <div className="column-header">
                  <h3>Sub-Categories {selectedCategoryId && <span className="category-tag" style={{marginLeft: '1rem'}}>{categories.find(c => c.id === selectedCategoryId)?.name}</span>}</h3>
                  <button className="btn-add-circle" onClick={() => { resetSubCategoryForm(); setIsSubCatModalOpen(true); }} disabled={!selectedCategoryId} title="Add Sub-Category" style={{ opacity: selectedCategoryId ? 1 : 0.5 }}>+</button>
                </div>
                <div className="admin-card" style={{padding: '0'}}>
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th className="action-cell"></th></tr></thead>
                    <tbody>
                      {subCategories.filter(sc => sc.category_id === selectedCategoryId).map(sc => (
                        <tr key={sc.id} className="selectable-row" onClick={() => handleEditSubCategoryOpen(sc)}>
                          <td>{sc.name}</td>
                          <td className="action-cell">
                            <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteSubCategory(sc.id, sc.name); }} title="Delete Sub-Category">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {subCategories.filter(sc => sc.category_id === selectedCategoryId).length === 0 && (
                        <tr><td colSpan={2} style={{textAlign: 'center', padding: '2rem', color: '#999'}}>No sub-categories found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modals */}
            {isCatModalOpen && (
              <div className="modal-backdrop" onClick={() => { resetCategoryForm(); setIsCatModalOpen(false); }}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => { resetCategoryForm(); setIsCatModalOpen(false); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <h3>{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h3>
                  <form onSubmit={handleAddCategory}>
                    <div className="form-group"><label>Category Name</label><input value={catName} onChange={e => setCatName(e.target.value)} required /></div>
                    <div className="form-group">
                      <label>Category Image</label>
                      <input type="file" onChange={e => setCatImageFile(e.target.files?.[0] || null)} accept="image/*" required={!editingCategoryId} />
                      {(catImageFile || existingCatImageUrl) && (
                        <div className="image-preview-grid" style={{ marginTop: '1rem' }}>
                          <div className="preview-item">
                            <img src={catImageFile ? URL.createObjectURL(catImageFile) : existingCatImageUrl!} alt="preview" />
                          </div>
                        </div>
                      )}
                    </div>
                    <button type="submit" className="admin-btn btn-primary" style={{width: '100%'}} disabled={isUploading}>{isUploading ? 'Uploading...' : (editingCategoryId ? 'Update Category' : 'Save Category')}</button>
                  </form>
                </div>
              </div>
            )}
            {isSubCatModalOpen && (
              <div className="modal-backdrop" onClick={() => { resetSubCategoryForm(); setIsSubCatModalOpen(false); }}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => { resetSubCategoryForm(); setIsSubCatModalOpen(false); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <h3>{editingSubCategoryId ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h3>
                  {editingSubCategoryId ? (
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label>Parent Category</label>
                      <select 
                        value={subCatParentId} 
                        onChange={e => setSubCatParentId(e.target.value)}
                        style={{ padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f0f0f5', background: '#f7f7fa' }}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p>Parent: <strong>{categories.find(c => c.id === selectedCategoryId)?.name}</strong></p>
                  )}
                  <form onSubmit={handleAddSubCategory}>
                    <div className="form-group"><label>Sub-Category Name</label><input value={subCatName} onChange={e => setSubCatName(e.target.value)} required /></div>
                    <button type="submit" className="admin-btn btn-primary" style={{width: '100%'}}>{editingSubCategoryId ? 'Update Sub-Category' : 'Save Sub-Category'}</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="view-products">
            <header className="admin-header"><h2>Product Management</h2><button className="btn-add-circle" onClick={() => { resetProductForm(); setIsProdModalOpen(true); }}>+</button></header>
            <div className="admin-card" style={{padding: '0'}}>
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Category</th><th>Sub-Category</th><th>Variants</th><th className="action-cell"></th></tr></thead>
                <tbody>
                  {products.map(p => {
                    const variants = p.product_variants || [];
                    const displayCategory = (p as any).categories?.name || '-';
                    const displaySubCategory = (p as any).sub_categories?.name || '-';
                    
                    return (
                      <tr key={p.id} className="selectable-row" onClick={() => handleEditOpen(p)}>
                        <td>
                          <strong>{p.name}</strong><br/>
                          <small>{p.series}</small>
                          {p.is_top_seller && <span className="category-tag" style={{ marginLeft: '10px', fontSize: '0.6rem', padding: '1px 5px' }}>TOP SELLER</span>}
                        </td>
                        <td><span className="category-tag">{displayCategory}</span></td>
                        <td>{displaySubCategory}</td>
                        <td>
                          {variants.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {variants.slice(0, 3).map((v, i) => (
                                <span key={i} style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f0f0f5', borderRadius: '4px' }}>
                                  {v.value}
                                </span>
                              ))}
                              {variants.length > 3 && <span style={{ fontSize: '0.7rem', color: '#888' }}>+{variants.length - 3} more</span>}
                            </div>
                          ) : <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.8rem' }}>No variants</span>}
                        </td>
                        <td className="action-cell">
                          <button 
                            className="btn-delete" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setDeletingProduct(p);
                            }} 
                            title="Delete Product"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Confirmation Modal */}
            {deletingProduct && (
              <div className="modal-backdrop" onClick={() => setDeletingProduct(null)}>
                <div className="modal-content modal-confirm" onClick={e => e.stopPropagation()}>
                  <div className="confirm-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </div>
                  <h3>Confirm Deletion</h3>
                  <p>Are you sure you want to delete <strong>{deletingProduct.name}</strong>? This will also remove all its variants and images from storage.</p>
                  <div className="modal-footer-row" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="admin-btn btn-secondary" onClick={() => setDeletingProduct(null)}>Cancel</button>
                    <button className="admin-btn btn-danger" onClick={() => handleDeleteProduct(deletingProduct)}>Delete Product</button>
                  </div>
                </div>
              </div>
            )}
            {isProdModalOpen && (
              <div className="modal-backdrop" onClick={() => { resetProductForm(); setIsProdModalOpen(false); }}>
                <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => { resetProductForm(); setIsProdModalOpen(false); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <div className="modal-header-row">
                    <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                    <label className="top-seller-switch" title="Mark as Top Seller">
                      <span className="switch-label">Top Seller</span>
                      <div className="toggle-wrapper">
                        <input 
                          type="checkbox" 
                          checked={prodTopSeller} 
                          onChange={e => setProdTopSeller(e.target.checked)} 
                        />
                        <div className="toggle-slider"></div>
                      </div>
                    </label>
                  </div>
                  <form onSubmit={handleAddProduct}>
                    <div className="form-grid">
                      <div className="form-group"><label>Product Name</label><input value={prodName} onChange={e => setProdName(e.target.value)} required /></div>
                      <div className="form-group"><label>Series</label><input value={prodSeries} onChange={e => setProdSeries(e.target.value)} /></div>
                      <div className="form-group"><label>Base Price</label><input type="number" value={prodBasePrice} onChange={e => setProdBasePrice(e.target.value)} placeholder="Optional" /></div>
                      <div className="form-group full-width">
                        <label>Common Images</label>
                        <div className="image-upload-wrapper">
                          <input type="file" multiple accept="image/*" onChange={e => {
                            const newFiles = Array.from(e.target.files || []);
                            setProdImages([...prodImages, ...newFiles]);
                            e.target.value = ''; // Reset input to allow same file selection
                          }} />
                        </div>
                        {(existingProdImages.length > 0 || prodImages.length > 0) && (
                          <div className="image-preview-grid">
                            {existingProdImages.map((url, idx) => (
                              <div key={`exist-${idx}`} className="preview-item">
                                <img src={url} alt="existing" />
                                <button type="button" className="btn-remove-image" onClick={() => removeCommonExistingImage(url)}>×</button>
                              </div>
                            ))}
                            {prodImages.map((file, idx) => (
                              <div key={`new-${idx}`} className="preview-item">
                                <img src={URL.createObjectURL(file)} alt="new" />
                                <button type="button" className="btn-remove-image" onClick={() => removeCommonNewImage(idx)}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="form-group"><label>Category</label>
                        <div className={`custom-dropdown ${isCatDropdownOpen ? 'open' : ''}`} ref={catDropdownRef}>
                          <div className="dropdown-trigger" onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}>
                            <span>{categories.find(c => c.id === prodCatId)?.name || 'Select Category'}</span>
                            <span className="dropdown-trigger-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </span>
                          </div>
                          {isCatDropdownOpen && (
                            <div className="dropdown-menu">
                              <div className="dropdown-search-wrapper" onClick={e => e.stopPropagation()}>
                                <input 
                                  autoFocus
                                  className="dropdown-search-input" 
                                  placeholder="Search categories..." 
                                  value={catSearchQuery} 
                                  onChange={e => setCatSearchQuery(e.target.value)} 
                                />
                              </div>
                              <div className="dropdown-list">
                                <div 
                                  className={`dropdown-item ${!prodCatId ? 'active' : ''}`}
                                  onClick={() => { setProdCatId(''); setProdSubCatId(''); setIsCatDropdownOpen(false); setCatSearchQuery(''); }}
                                >
                                  Select Category
                                </div>
                                {categories
                                  .filter(c => c.name.toLowerCase().includes(catSearchQuery.toLowerCase()))
                                  .map(c => (
                                    <div 
                                      key={c.id} 
                                      className={`dropdown-item ${prodCatId === c.id ? 'active' : ''}`}
                                      onClick={() => {
                                        setProdCatId(c.id);
                                        setProdSubCatId('');
                                        setIsCatDropdownOpen(false);
                                        setCatSearchQuery('');
                                      }}
                                    >
                                      {c.name}
                                    </div>
                                  ))
                                }
                                {categories.filter(c => c.name.toLowerCase().includes(catSearchQuery.toLowerCase())).length === 0 && (
                                  <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>No categories found</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="form-group"><label>Sub Category</label>
                        <div className={`custom-dropdown ${isSubCatDropdownOpen ? 'open' : ''}`} ref={subCatDropdownRef}>
                          <div className="dropdown-trigger" onClick={() => setIsSubCatDropdownOpen(!isSubCatDropdownOpen)}>
                            <span>{subCategories.find(sc => sc.id === prodSubCatId)?.name || 'Select Sub Category'}</span>
                            <span className="dropdown-trigger-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </span>
                          </div>
                          {isSubCatDropdownOpen && (
                            <div className="dropdown-menu">
                              <div className="dropdown-search-wrapper" onClick={e => e.stopPropagation()}>
                                <input 
                                  autoFocus
                                  className="dropdown-search-input" 
                                  placeholder="Search sub-categories..." 
                                  value={subCatSearchQuery} 
                                  onChange={e => setSubCatSearchQuery(e.target.value)} 
                                />
                              </div>
                              <div className="dropdown-list">
                                <div 
                                  className={`dropdown-item ${!prodSubCatId ? 'active' : ''}`}
                                  onClick={() => { setProdSubCatId(''); setIsSubCatDropdownOpen(false); setSubCatSearchQuery(''); }}
                                >
                                  Select Sub Category
                                </div>
                                {subCategories
                                  .filter(sc => sc.category_id === prodCatId)
                                  .filter(sc => sc.name.toLowerCase().includes(subCatSearchQuery.toLowerCase()))
                                  .map(sc => (
                                    <div 
                                      key={sc.id} 
                                      className={`dropdown-item ${prodSubCatId === sc.id ? 'active' : ''}`}
                                      onClick={() => {
                                        setProdSubCatId(sc.id);
                                        setIsSubCatDropdownOpen(false);
                                        setSubCatSearchQuery('');
                                      }}
                                    >
                                      {sc.name}
                                    </div>
                                  ))
                                }
                                {subCategories
                                  .filter(sc => categories.find(c => c.id === sc.category_id)?.name === categories.find(c => c.id === prodCatId)?.name)
                                  .filter(sc => sc.name.toLowerCase().includes(subCatSearchQuery.toLowerCase())).length === 0 && (
                                  <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>No sub-categories found</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="form-group full-width"><label>Description</label><textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} rows={3}></textarea></div>
                    </div>
                    <div className="variants-section">
                      <div className="variant-header">
                        <h4>Product Variants</h4>
                        <button type="button" onClick={addVariantGroup} className="admin-btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>
                          + Add Variant Group
                        </button>
                      </div>
                      
                      {prodVariants.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9f9fb', borderRadius: '14px', border: '1.5px dashed #eee', color: '#999', fontSize: '0.9rem' }}>
                          No variants added yet. Add groups like Size, Color, or Material.
                        </div>
                      )}

                      {prodVariants.map((group, gIndex) => (
                        <div key={gIndex} className="variant-group">
                          <div className="variant-header">
                            <div className="variant-title-row">
                              <div className="variant-type-selector">
                                <button 
                                  type="button" 
                                  className={`variant-type-btn ${group.type === 'standard' ? 'active' : ''}`}
                                  onClick={() => updateVariantType(gIndex, 'standard')}
                                >
                                  Standard
                                </button>
                                <button 
                                  type="button" 
                                  className={`variant-type-btn ${group.type === 'color' ? 'active' : ''}`}
                                  onClick={() => updateVariantType(gIndex, 'color')}
                                >
                                  Color
                                </button>
                              </div>
                              <input 
                                value={group.name} 
                                onChange={e => updateVariantName(gIndex, e.target.value)} 
                                placeholder="Group Name (e.g. Size)" 
                              />
                            </div>
                            <button type="button" onClick={() => removeVariantGroup(gIndex)} className="btn-remove-group" title="Remove Group">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          </div>
                          
                          <div className="variant-list-header">
                            <span style={{ flex: '1' }}>Value / Hex</span>
                            <span style={{ flex: '1' }}>Price</span>
                            <span style={{ flex: '1' }}>Image</span>
                            <span style={{ flex: '0 0 40px' }}></span>
                          </div>
                          <div className="variant-list-container">
                            {group.values.map((v, vIndex) => {
                              const isHex = /^#([A-Fa-f0-9]{3}){1,2}$/.test(v.value);
                              const showError = group.type === 'color' && v.value && !isHex;

                              return (
                                <div key={vIndex} className="variant-item-row">
                                  <div className="variant-item-value-wrapper">
                                    {group.type === 'color' && isHex && <div className="color-preview-chip" style={{ background: v.value }}></div>}
                                    <input 
                                      placeholder={group.type === 'color' ? '#FFFFFF' : 'Value'} 
                                      className={showError ? 'variant-input-error' : ''}
                                      value={v.value} 
                                      onChange={e => updateVariantValueField(gIndex, vIndex, 'value', e.target.value)} 
                                    />
                                  </div>
                                  <div className="variant-item-price">
                                    <input 
                                      placeholder="Price" 
                                      value={v.price} 
                                      onChange={e => updateVariantValueField(gIndex, vIndex, 'price', e.target.value)} 
                                    />
                                  </div>
                                  <div className="variant-item-image">
                                    <div className="variant-thumb-container">
                                      {((v.images?.length ?? 0) > 0 || (v.image_files?.length ?? 0) > 0) ? (
                                        <div className="variant-previews">
                                          {v.images?.map((url, idx) => (
                                            <div key={`vexist-${idx}`} className="mini-preview">
                                              <img src={url} alt="exist" />
                                              <button type="button" onClick={(e) => { e.stopPropagation(); removeVariantExistingImage(gIndex, vIndex, url); }}>×</button>
                                            </div>
                                          ))}
                                          {v.image_files?.map((file, idx) => (
                                            <div key={`vnew-${idx}`} className="mini-preview">
                                              <img src={URL.createObjectURL(file)} alt="new" />
                                              <button type="button" onClick={(e) => { e.stopPropagation(); removeVariantNewImage(gIndex, vIndex, idx); }}>×</button>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                      )}
                                      <input 
                                        type="file" 
                                        multiple
                                        className="variant-image-input" 
                                        accept="image/*"
                                        onChange={e => {
                                          const newFiles = Array.from(e.target.files || []);
                                          const currentFiles = v.image_files || [];
                                          updateVariantValueField(gIndex, vIndex, 'image_files', [...currentFiles, ...newFiles]);
                                          e.target.value = '';
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <button type="button" className="btn-delete" onClick={() => removeVariantValue(gIndex, vIndex)} title="Remove Value">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          
                          <button 
                            type="button" 
                            className="admin-btn btn-secondary" 
                            style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem', padding: '0.7rem' }}
                            onClick={() => addVariantValue(gIndex)}
                          >
                            + Add Another Value
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="admin-btn btn-primary" style={{marginTop: '2rem', width: '100%'}} disabled={isUploading}>{isUploading ? 'Uploading...' : 'Save Product'}</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
