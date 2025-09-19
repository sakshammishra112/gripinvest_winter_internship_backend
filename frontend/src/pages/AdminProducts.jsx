import React, { useEffect, useState } from 'react';
import axios from 'axios';

const defaultProduct = {
  name: '',
  investmentType: 'bond',
  tenureMonths: 0,
  annualYield: '',
  riskLevel: 'low',
  minInvestment: '',
  maxInvestment: '',
  description: ''
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [newProduct, setNewProduct] = useState({ ...defaultProduct });
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    axios.get('/api/getUser').then(res => setUser(res.data));
    axios.get('/api/products').then(res => setProducts(res.data));
  }, []);

  const handleAddProduct = () => {
    axios.post('/api/products', newProduct)
      .then(res => {
        setProducts([...products, res.data]);
        setNewProduct({ ...defaultProduct });
      })
      .catch(err => alert('Add failed'));
  };

  const handleDeleteProduct = (id) => {
    axios.delete(`/api/products/${id}`)
      .then(() => setProducts(products.filter(p => p.id !== id)))
      .catch(err => alert('Delete failed'));
  };

  const handleUpdateProduct = () => {
    axios.put(`/api/products/${editProduct.id}`, editProduct)
      .then(res => {
        setProducts(products.map(p => p.id === editProduct.id ? res.data : p));
        setEditProduct(null);
      })
      .catch(err => alert('Update failed'));
  };

  if (!user) return <div>Loading...</div>;
  const isAdmin = (user.role || '').toUpperCase() === 'ADMIN';

  const investmentTypes = ['bond', 'fd', 'mf', 'etf', 'other'];
  const riskLevels = ['low', 'moderate', 'high'];
 return (
    <div>
      <h2>Admin Products</h2>
      {/* Add Product - only for admin */}
      {isAdmin && (
        <div>
          <input
            placeholder="Name"
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <select
            value={newProduct.investmentType}
            onChange={e => setNewProduct({ ...newProduct, investmentType: e.target.value })}
          >
            {investmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <input
            type="number"
            placeholder="Tenure (months)"
            value={newProduct.tenureMonths}
            onChange={e => setNewProduct({ ...newProduct, tenureMonths: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Annual Yield"
            value={newProduct.annualYield}
            onChange={e => setNewProduct({ ...newProduct, annualYield: e.target.value })}
          />
          <select
            value={newProduct.riskLevel}
            onChange={e => setNewProduct({ ...newProduct, riskLevel: e.target.value })}
          >
            {riskLevels.map(level => <option key={level} value={level}>{level}</option>)}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Min Investment"
            value={newProduct.minInvestment}
            onChange={e => setNewProduct({ ...newProduct, minInvestment: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Max Investment"
            value={newProduct.maxInvestment}
            onChange={e => setNewProduct({ ...newProduct, maxInvestment: e.target.value })}
          />
          <input
            placeholder="Description"
            value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <button onClick={handleAddProduct}>Add Product</button>
        </div>
      )}
      {/* Product List */}
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {editProduct && editProduct.id === product.id ? (
              isAdmin ? (
                <>
                  <input
                    value={editProduct.name}
                    onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                  />
                  <select
                    value={editProduct.investmentType}
                    onChange={e => setEditProduct({ ...editProduct, investmentType: e.target.value })}
                  >
                    {investmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input
                    type="number"
                    value={editProduct.tenureMonths}
                    onChange={e => setEditProduct({ ...editProduct, tenureMonths: e.target.value })}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.annualYield}
                    onChange={e => setEditProduct({ ...editProduct, annualYield: e.target.value })}
                  />
                  <select
                    value={editProduct.riskLevel}
                    onChange={e => setEditProduct({ ...editProduct, riskLevel: e.target.value })}
                  >
                    {riskLevels.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.minInvestment}
                    onChange={e => setEditProduct({ ...editProduct, minInvestment: e.target.value })}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.maxInvestment}
                    onChange={e => setEditProduct({ ...editProduct, maxInvestment: e.target.value })}
                  />
                  <input
                    value={editProduct.description}
                    onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                  />
                  <button onClick={handleUpdateProduct}>Save</button>
                  <button onClick={() => setEditProduct(null)}>Cancel</button>
                </>
              ) : null
            ) : (
              <>
                {product.name} | {product.investmentType} | {product.tenureMonths}m | {product.annualYield}% | {product.riskLevel} | Min: {product.minInvestment} | Max: {product.maxInvestment} | {product.description}
                {isAdmin && (
                  <>
                    <button onClick={() => setEditProduct(product)}>Edit</button>
                    <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminProducts;