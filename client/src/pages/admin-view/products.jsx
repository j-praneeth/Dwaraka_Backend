/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
import ProductImageUpload from "@/components/admin-view/image-upload";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProductFormElements, fetchSizesByCategory } from "@/config";
import { fetchCategories } from "@/store/shop/category-slice";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  sizes: [],
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [formControls, setFormControls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { productList } = useSelector((state) => state.adminProducts);
  const { categories = [] } = useSelector((state) => state.category || { categories: [] });
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    const loadFormElements = async () => {
      const elements = await addProductFormElements();
      setFormControls(elements);
    };

    loadFormElements();
    dispatch(fetchAllProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (currentEditedId !== null) {
        await handleEditProduct();
      } else {
        const productData = {
          image: uploadedImageUrl,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          brand: formData.brand,
          price: formData.price,
          salePrice: formData.salePrice,
          totalStock: formData.totalStock,
          averageReview: formData.averageReview,
          sizes: formData.sizes,
        };

        const result = await dispatch(addNewProduct(productData));
        if (result?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          setImageFile(null);
          setFormData(initialFormData);
          toast({ title: "Product added successfully" });
        } else {
          toast({
            title: "Error adding product",
            description: result?.payload?.message || "Unknown error occurred.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async () => {
    try {
      const productData = {
        image: formData.image,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        price: formData.price,
        salePrice: formData.salePrice,
        totalStock: formData.totalStock,
        averageReview: formData.averageReview,
        sizes: formData.sizes,
      };

      const result = await dispatch(editProduct({ id: currentEditedId, productData }));
      if (result.payload && result.payload.success) {
        dispatch(fetchAllProducts());
        setOpenCreateProductsDialog(false);
        setCurrentEditedId(null);
        setFormData(initialFormData);
        toast({ title: "Product updated successfully" });
      } else {
        toast({
          title: "Error updating product",
          description: result.payload ? result.payload.message : "Unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the product.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (getCurrentProductId) => {
    try {
      const result = await dispatch(deleteProduct(getCurrentProductId));
      if (result?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({ title: "Product deleted successfully" });
      } else {
        toast({
          title: "Error deleting product",
          description: result?.payload?.message || "Unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = async (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
      sizes: [],
    }));

    const sizes = await fetchSizesByCategory(categoryId);
    
    setFormControls((prevControls) =>
      prevControls.map((control) =>
        control.name === "sizes"
          ? {
              ...control,
              options: sizes.map((size) => ({
                id: size,
                label: size,
              })),
            }
          : control
      )
    );
  };

  const handleChange = async (event) => {
    const { name, value } = event.target;
    
    if (name === "category") {
      await handleCategoryChange(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedProducts = productList
    ? [...productList]
        .filter(product => 
          (!selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase()) &&
          (product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
          if (sortOrder === 'asc') {
            return a.price - b.price;
          } else {
            return b.price - a.price;
          }
        })
    : [];

  return (
    <Fragment>
      <div className="mb-5 w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading categories...</option>
            )}
          </select>
          <Button 
            onClick={handleSort}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Sort by Price {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
          <Button 
            onClick={() => setOpenCreateProductsDialog(true)}
            className="flex-1 sm:flex-none"
          >
            Add New Product
          </Button>
        </div>
      </div>
      <div className="w-full overflow-auto bg-white rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 text-left font-semibold text-gray-600">S.No</th>
              <th className="p-4 text-left font-semibold text-gray-600">Image</th>
              <th className="p-4 text-left font-semibold text-gray-600">Title</th>
              <th className="p-4 text-left font-semibold text-gray-600">Price</th>
              <th className="p-4 text-left font-semibold text-gray-600">Sale Price</th>
              <th className="p-4 text-left font-semibold text-gray-600">Stock</th>
              <th className="p-4 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((productItem, index) => (
                <tr key={productItem._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-800">{index + 1}</td>
                  <td className="p-4">
                    <div className="w-16 h-16 overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={productItem.image}
                        alt={productItem.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{productItem.title}</td>
                  <td className="p-4 text-gray-800">₹{productItem.price}</td>
                  <td className="p-4 text-gray-800">
                    {productItem.salePrice ? (
                      <span className="text-green-600">₹{productItem.salePrice}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${productItem.totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {productItem.totalStock}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <Button
                      onClick={() => {
                        setFormData({
                          image: productItem.image,
                          title: productItem.title,
                          description: productItem.description,
                          category: productItem.category,
                          brand: productItem.brand,
                          price: productItem.price,
                          salePrice: productItem.salePrice,
                          totalStock: productItem.totalStock,
                          averageReview: productItem.averageReview,
                          sizes: productItem.sizes,
                        });
                        setCurrentEditedId(productItem._id);
                        setOpenCreateProductsDialog(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                      disabled={isLoading}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(productItem._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500 bg-gray-50">
                  {searchTerm ? 'No products found matching your search.' : 'No products available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={formControls}
              handleChange={handleChange}
              isLoading={isLoading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
