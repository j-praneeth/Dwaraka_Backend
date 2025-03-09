/* eslint-disable no-unused-vars */
import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash } from "lucide-react";
import { updateReturnStatus, getAllReturnRequests } from "@/store/admin/order-slice";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const [loading, setLoading] = useState(false);

  console.log(uploadedImageUrl, "uploadedImageUrl");

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  useEffect(() => {
    const fetchFeatureImages = async () => {
      setLoading(true);
      await dispatch(getFeatureImages());
      setLoading(false);
    };

    fetchFeatureImages();
  }, [dispatch]);

  const handleDeleteImage = async (id) => {
    console.log("Deleting image with ID:", id);
    const response = await dispatch(deleteFeatureImage(id));
    if (response.payload && response.payload.success) {
      await dispatch(getFeatureImages());
    } else {
      console.error("Failed to delete feature image:", response.payload ? response.payload.message : "No response");
    }
  };

  const handleStatusChange = async (orderId, status) => {
    console.log("Updating return status for order ID:", orderId, "to status:", status);
    const response = await dispatch(updateReturnStatus({ orderId, status }));
    if (response.payload && response.payload.success) {
      await dispatch(getAllReturnRequests());
    } else {
      console.error("Failed to update return request status:", response.payload ? response.payload.message : "No response");
    }
  };

  console.log(featureImageList, "featureImageList");

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
        // isEditMode={currentEditedId !== null}
      />
      <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
        Upload
      </Button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-4 mt-5">
          {featureImageList && featureImageList.length > 0
            ? featureImageList.map((featureImgItem) => (
                <div className="relative" key={featureImgItem._id}>
                  <img
                    src={featureImgItem.image}
                    className="w-full h-[300px] object-cover rounded-t-lg"
                  />
                  <Button
                    onClick={() => handleDeleteImage(featureImgItem._id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    title="Delete Image"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>

                  {/* Dropdown for Return Status */}
                  {featureImgItem.returnRequest ? (
                    <select
                      value={featureImgItem.returnRequest.status || ''}
                      onChange={(e) => handleStatusChange(featureImgItem.orderId, e.target.value)}
                      className="absolute top-10 right-2 p-1 border rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span></span>
                  )}
                </div>
              ))
            : <p>No feature images available.</p>}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
