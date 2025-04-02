import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { 
  addFeatureImage, 
  getFeatureImages,
  deleteFeatureImage 
} from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  const handleDeleteFeatureImage = (imageUrl) => {
    dispatch(deleteFeatureImage(imageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
      }
    });
  };

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <ProductImageUpload
          imageFile={imageFile}
          setImageFile={setImageFile}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isCustomStyling={true}
        />
        
        <Button 
          onClick={handleUploadFeatureImage} 
          className="mt-4 w-full"
          disabled={!uploadedImageUrl}
        >
          Upload Feature Image
        </Button>

        <div className="mt-8 grid gap-6">
          {featureImageList?.map((featureImgItem) => (
            <div 
              key={featureImgItem._id} 
              className="relative group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={featureImgItem.image}
                className="w-full h-48 object-cover"
                alt="Feature content"
              />
              
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full aspect-square p-2"
                onClick={() => handleDeleteFeatureImage(featureImgItem.image)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;