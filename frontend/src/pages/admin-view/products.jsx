import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: "",
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function isFormValid() {
    const requiredFieldsValid = Object.keys(formData)
      .filter(key => key !== "averageReview" && key !== "salePrice")
      .every(key => formData[key] !== "" && formData[key] !== null);

    const imageValid = currentEditedId ? 
      // For edit: either existing image or new upload
      (formData.image || uploadedImageUrl) : 
      // For new: must have uploaded image
      (uploadedImageUrl && isImageUploaded);

    return requiredFieldsValid && imageValid;
  }


 // Add this useEffect to sync the uploaded image URL with formData
useEffect(() => {
  if (uploadedImageUrl) {
    setFormData(prev => ({
      ...prev,
      image: uploadedImageUrl
    }));
  }
}, [uploadedImageUrl]);

function onSubmit(event) {
  event.preventDefault();

  // Final validation
  if (!isFormValid()) {
    toast({
      title: "Validation Error",
      description: "Please fill all required fields and upload an image",
      variant: "destructive"
    });
    return;
  }

  const payload = {
    ...formData,
    image: uploadedImageUrl || formData.image,
    price: Number(formData.price),
    salePrice: formData.salePrice ? Number(formData.salePrice) : null,
    totalStock: Number(formData.totalStock),
    averageReview: Number(formData.averageReview)
  };

  // Clean payload from empty values
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== null && v !== "")
  );

  const action = currentEditedId 
    ? editProduct({ id: currentEditedId, formData: cleanPayload })
    : addNewProduct(cleanPayload);

  dispatch(action).then((data) => {
    if (data?.payload?.success) {
      // Reset all states
      setOpenCreateProductsDialog(false);
      setCurrentEditedId(null);
      setFormData(initialFormData);
      setImageFile(null);
      setUploadedImageUrl("");
      setIsImageUploaded(false);
      
      // Refresh product list
      dispatch(fetchAllProducts());
      
      toast({
        title: `Product ${currentEditedId ? 'updated' : 'added'} successfully`,
      });
    }
  });

}

  console.log(formData, "productList");

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
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
          // Update your ProductImageUpload component usage
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={formData.image}
            setUploadedImageUrl={(url) => {
              setUploadedImageUrl(url);
              setFormData(prev => ({ ...prev, image: url }));
              setIsImageUploaded(true); // Mark upload as complete
            }}
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
            formControls={addProductFormElements}
            isBtnDisabled={!isFormValid() || imageLoadingState} // Disable during upload
          />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
