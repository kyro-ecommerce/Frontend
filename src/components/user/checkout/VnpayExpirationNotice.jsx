import { useEffect, useState } from 'react';
import { parseUtcInstant } from '../../../utils/date';

const formatRemaining = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const VnpayExpirationNotice = ({ order, onRetry, isRetrying = false }) => {
  const [now, setNow] = useState(Date.now());
  const expiresAt = parseUtcInstant(order?.expiresAt);
  const visible =
    order?.paymentMethod === 'VNPAY' &&
    order?.orderStatus === 'PENDING' &&
    order?.paymentStatus !== 'COMPLETED' &&
    expiresAt;

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [visible, order?.expiresAt]);

  if (!visible) return null;

  const remainingSeconds = Math.max(0, Math.ceil((expiresAt.getTime() - now) / 1000));
  const expired = remainingSeconds === 0;

  return (
    <div
      role="status"
      className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
        expired
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}
    >
      {expired ? (
        <span>Thời gian thanh toán đã hết. Đơn hàng đang chờ hệ thống hủy và hoàn tồn kho.</span>
      ) : (
        <>
          <span>
            Hoàn tất thanh toán VNPAY trong{' '}
            <strong className="tabular-nums">{formatRemaining(remainingSeconds)}</strong>. Hạn thanh
            toán: {expiresAt.toLocaleString('vi-VN')}.
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="mt-3 block rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRetrying ? 'ĐANG TẠO THANH TOÁN...' : 'THANH TOÁN LẠI'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default VnpayExpirationNotice;
