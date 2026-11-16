import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  RiCheckboxCircleFill, 
  RiArrowRightSLine, 
  RiShoppingBag3Line,
  RiHandCoinLine,
  RiTruckLine,
  RiSecurePaymentLine
} from 'react-icons/ri';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id') || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const method = searchParams.get('method') || 'cod';
  const isCod = method === 'cod' || method === 'Cash on Delivery';

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-lg mx-auto">
      {/* Animated Checkmark Wrapper */}
      <div className="relative w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-8 animate-bounce">
        <RiCheckboxCircleFill className="w-16 h-16 text-emerald-500" />
      </div>

      {/* Success Title */}
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
        Thank You for Your Order!
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {isCod
          ? 'Your Cash on Delivery order has been confirmed. We are preparing your parcel for fast UAE doorstep delivery.'
          : 'Your payment was processed successfully, and your order has been placed. We are preparing it for delivery.'}
      </p>

      {/* Cash on Delivery Notice Banner */}
      {isCod && (
        <div className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-left mb-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <RiHandCoinLine className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-xs text-slate-700 dark:text-slate-300">
            <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              Cash on Delivery (COD) Active
            </span>
            <p className="mt-1 text-slate-600 dark:text-slate-400 leading-normal">
              Please have the exact cash amount in <strong>AED</strong> ready for our courier partner upon arrival at your doorstep.
            </p>
          </div>
        </div>
      )}

      {/* Order Info Panel */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs text-left mb-8 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-100 dark:border-slate-850 pb-3 mb-1">
          <span className="text-slate-400">Order Number</span>
          <span className="text-slate-900 dark:text-white font-mono font-bold">{orderId}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-100 dark:border-slate-850 pb-3 mb-1">
          <span className="text-slate-400">Payment Option</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            {isCod ? (
              <>
                <RiHandCoinLine className="w-4 h-4" /> Cash on Delivery (COD)
              </>
            ) : (
              <>
                <RiSecurePaymentLine className="w-4 h-4" /> Card Payment
              </>
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-100 dark:border-slate-850 pb-3 mb-1">
          <span className="text-slate-400">Payment Status</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
            isCod 
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isCod ? 'Pay on Delivery' : 'Paid Online'}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-100 dark:border-slate-850 pb-3 mb-1">
          <span className="text-slate-400">Estimated Delivery</span>
          <span className="text-slate-900 dark:text-white font-bold flex items-center gap-1">
            <RiTruckLine className="w-4 h-4 text-primary-500" />
            2-4 Business Days (UAE)
          </span>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-slate-400">Confirmation Sent</span>
          <span className="text-slate-900 dark:text-white font-bold">Via Email & SMS</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Link
          to="/shop"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
        >
          <RiShoppingBag3Line className="w-4 h-4" />
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="flex-1 flex items-center justify-center gap-1 py-3 px-6 rounded-xl border border-slate-202 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          View My Orders
          <RiArrowRightSLine className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
