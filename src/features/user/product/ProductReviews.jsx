import React, { useState, useEffect, useCallback } from "react";
import { Rating } from '@mui/material';
import { reviewService } from "../../../services/user/review.service";
import { authService } from "../../../services/user/auth.service";
import { useToast } from "../../../store/user/ToastContext.jsx";
import StarIcon from '@mui/icons-material/Star';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const ProductReviews = ({ productId, onRatingUpdate, initialAverageRating, initialTotalReviews }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(initialAverageRating || 0);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews || 0);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [reviewsPerPage] = useState(5);

  const { showToast } = useToast();

  const [ratingCounts, setRatingCounts] = useState([
    { stars: 5, count: 0 }, { stars: 4, count: 0 }, { stars: 3, count: 0 },
    { stars: 2, count: 0 }, { stars: 1, count: 0 }
  ]);

  const fetchReviews = useCallback(async () => {
    if (!productId) return { averageRating: 0, totalReviews: 0 };
    try {
      const response = await reviewService.getReviewsByProduct(productId);
      const result = response.data;
      const tempp = await reviewService.canReview(productId);
      setCanReview(Boolean(tempp?.data?.data));

      if (result.data) {
        const { reviews: fetchedReviews = [], averageRating: avgRating = 0, ratingDistribution = {}, productName: fetchedProductName = "", totalReviews: total = 0 } = result.data;

        const formattedReviews = fetchedReviews
          .map(review => ({
            id: review.id,
            userName: `${review.userFirstName || ''} ${review.userLastName || ''}`.trim() || 'Người dùng',
            userFirstName: review.userFirstName,
            userLastName: review.userLastName,
            rating: review.rating,
            comment: review.review,
            date: new Date(review.createdAt).toLocaleDateString('vi-VN'),
            createdAt: new Date(review.createdAt),
            verified: true,
            userId: review.userId
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

        const counts = [
          { stars: 5, count: ratingDistribution["5"] || 0 },
          { stars: 4, count: ratingDistribution["4"] || 0 },
          { stars: 3, count: ratingDistribution["3"] || 0 },
          { stars: 2, count: ratingDistribution["2"] || 0 },
          { stars: 1, count: ratingDistribution["1"] || 0 }
        ];

        setReviews(formattedReviews);
        setRatingCounts(counts);
        setAverageRating(avgRating);
        setProductName(fetchedProductName);
        setTotalReviews(total);

        if (onRatingUpdate) {
          onRatingUpdate(avgRating, total);
        }
        return { averageRating: avgRating, totalReviews: total };

      } else {
         setReviews([]);
         setRatingCounts([{ stars: 5, count: 0 }, { stars: 4, count: 0 }, { stars: 3, count: 0 }, { stars: 2, count: 0 }, { stars: 1, count: 0 }]);
         setAverageRating(0);
         setTotalReviews(0);
         if (onRatingUpdate) {
          onRatingUpdate(0, 0);
         }
         return { averageRating: 0, totalReviews: 0 };
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setRatingCounts([{ stars: 5, count: 0 }, { stars: 4, count: 0 }, { stars: 3, count: 0 }, { stars: 2, count: 0 }, { stars: 1, count: 0 }]);
      setAverageRating(0);
      setTotalReviews(0);
      if (onRatingUpdate) {
        onRatingUpdate(0, 0);
      }
      return { averageRating: 0, totalReviews: 0 };
    }
  }, [productId, onRatingUpdate]);

  const fetchUser = async () => {
     try {
      const response = await authService.getUserProfile();
      if (response && response.data) {
        setCurrentUserId(response.data.id);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
      fetchUser();
    }
  }, [productId, fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (userRating === 0) {
      showToast("Vui lòng chọn số sao đánh giá", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
       await reviewService.addReview({
        productId,
        rating: userRating,
        content: comment
      });

      setUserRating(0);
      setComment("");
      setShowForm(false);
      await fetchReviews();
      setCurrentPage(1);
      showToast("Gửi đánh giá thành công!", "success");
    } catch (error) {
      console.error("Error submitting review:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi không xác định";
      showToast(`Lỗi khi gửi đánh giá: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
     if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
        setIsDeleting(true);
        try {
           await reviewService.deleteReview(reviewId);
           await fetchReviews();

           const newTotalFetchedReviews = reviews.length - 1 > 0 ? reviews.length - 1 : 0;
           const newTotalPages = Math.ceil(newTotalFetchedReviews / reviewsPerPage);
           if (currentPage > newTotalPages && currentPage > 1) {
             setCurrentPage(currentPage - 1);
           } else if (newTotalFetchedReviews === 0) {
             setCurrentPage(1);
           }

           showToast("Đã xóa đánh giá thành công!", "success");
        } catch (error) {
          console.error("Error deleting review:", error);
          const errorMessage = error?.response?.data?.message || error.message || "Lỗi không xác định";
          showToast(`Lỗi khi xóa đánh giá: ${errorMessage}`, "error");
        } finally {
           setIsDeleting(false);
        }
     }
  };

  const calculatePercentage = (count) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  const isCurrentUserReview = (review) => {
    return review.userId === currentUserId && currentUserId !== "";
  };

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const Pagination = () => {
     const calculatedTotalPages = Math.ceil(reviews.length / reviewsPerPage);
     if (calculatedTotalPages <= 1) return null;
     return (
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}`}
        >
          «
        </button>
        {Array.from({ length: calculatedTotalPages }, (_, i) => i + 1).map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => paginate(pageNumber)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pageNumber === currentPage
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          onClick={goToNextPage}
          disabled={currentPage === calculatedTotalPages}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${currentPage === calculatedTotalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}`}
        >
          »
        </button>
      </div>
    );
  };

  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-3xl border border-slate-200/70 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] my-10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Đánh giá & Nhận xét sản phẩm
        </h2>
      </div>

      {/* RATING SUMMARY ROW */}
      <div className="flex gap-8 mb-8 max-md:flex-col items-center">
        {/* Rating Score Card */}
        <div className="w-full sm:w-56 bg-white border border-gray-100 p-6 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-xs">
          <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">
            {averageRating?.toFixed(1) || "0.0"}<span className="text-xl text-gray-400 font-normal">/5</span>
          </div>
          <Rating value={averageRating || 0} readOnly precision={0.5} size="medium" />
          <div className="text-xs text-gray-500 font-medium mt-2">
            {totalReviews || 0} đánh giá và nhận xét
          </div>
        </div>

        {/* Rating Distribution Bars */}
        <div className="flex-1 w-full space-y-2">
          {ratingCounts.map((item) => (
            <div key={item.stars} className="flex gap-3 items-center text-xs sm:text-sm font-medium text-gray-600">
              <span className="w-6 font-bold flex items-center gap-0.5">{item.stars}<StarIcon fontSize="inherit" className="text-amber-400" /></span>
              <div className="flex-1 h-2 rounded-full bg-gray-200/80 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${calculatePercentage(item.count)}%` }}
                />
              </div>
              <span className="w-16 text-right text-gray-400 font-semibold text-xs">{item.count} đánh giá</span>
            </div>
          ))}
        </div>
      </div>

      {/* REVIEW TRIGGER BUTTON / FORM */}
      {!showForm ? (
        <div className="mb-8">
          {canReview ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-2xl shadow-md shadow-blue-100 transition-all cursor-pointer flex items-center gap-2"
            >
              <RateReviewOutlinedIcon fontSize="small" />
              <span>Viết đánh giá của bạn</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 text-amber-800 text-xs sm:text-sm font-semibold py-3 px-5 rounded-2xl shadow-2xs">
              <LockOutlinedIcon fontSize="small" className="text-amber-600" />
              <span>Bạn cần mua sản phẩm này trước khi đánh giá</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-2xl shadow-sm mb-8">
          <h3 className="font-extrabold text-gray-900 text-base mb-4 flex items-center gap-2">
            <RateReviewOutlinedIcon fontSize="small" className="text-blue-600" />
            <span>Viết đánh giá của bạn</span>
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Đánh giá sao *</label>
              <Rating
                name="user-rating"
                value={userRating}
                onChange={(event, newValue) => {
                  setUserRating(newValue ?? 0);
                }}
                size="large"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Nhận xét chi tiết</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                rows="3"
                placeholder="Chia sẻ trải nghiệm sử dụng thực tế của bạn về sản phẩm..."
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-6 rounded-2xl shadow-md shadow-red-100 transition-all cursor-pointer disabled:opacity-40"
                disabled={isSubmitting || userRating === 0}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                disabled={isSubmitting}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <div className="font-extrabold text-gray-900 text-sm">{review.userName}</div>
                <div className="flex items-center gap-3">
                  {review.verified && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>✓</span>
                      <span>Đã mua hàng</span>
                    </span>
                  )}
                  <span className="text-gray-400 text-xs font-medium">{review.date}</span>

                  {isCurrentUserReview(review) && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 cursor-pointer ml-2"
                      title="Xóa đánh giá"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <Rating value={review.rating} readOnly size="small" />
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white/80 rounded-2xl border border-dashed border-gray-200 shadow-2xs">
            <p className="text-xs text-gray-500 font-medium">Chưa có đánh giá nào cho sản phẩm này.</p>
          </div>
        )}
      </div>

      <Pagination />
    </section>
  );
};

export default ProductReviews;