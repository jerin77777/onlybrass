import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from './firebase'
import './App.css'

interface Product {
  id: string
  name: string
  price: number
  category: string
  description: string
  imageUrl: string
  stock: number
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await deleteDoc(doc(db, 'products', id))
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <main>
      <h1>Admin — Products</h1>
      <p>{products.length} products in database</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export default App
