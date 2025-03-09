/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/store/shop/category-slice";
import { fetchProductsByCategory } from "@/store/shop/product-slice";

function ProductList() {
  const dispatch = useDispatch();
  const { categories, isLoading: isLoadingCategories } = useSelector((state) => state.category);
  const { products, isLoading: isLoadingProducts } = useSelector((state) => state.product);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchProductsByCategory(selectedCategory));
    }
  }, [selectedCategory, dispatch]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    dispatch(fetchProductsByCategory(category));
  };

  return (
    <div>
      <h1>Products</h1>
      {isLoadingCategories ? (
        <p>Loading categories...</p>
      ) : (
        <div>
          <h2>Categories</h2>
          <ul>
            {categories.map((category) => (
              <li key={category._id} onClick={() => handleCategorySelect(category.name)}>
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isLoadingProducts ? (
        <p>Loading products...</p>
      ) : (
        <div>
          <h2>Products in {selectedCategory}</h2>
          <ul>
            {products.map((product) => (
              <li key={product._id}>{product.title} - ₹{product.price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProductList; 