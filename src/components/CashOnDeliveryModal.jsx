import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  RiCloseLine,
  RiHandCoinLine,
  RiTruckLine,
  RiPhoneLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiAddLine,
  RiSubtractLine
} from 'react-icons/ri';

const UAE_EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain'
];

const DELIVERY_TIMES = [
  'Anytime (Fastest Dispatch)',
  'Morning (9:00 AM – 1:00 PM)',
  'Afternoon (1:00 PM – 6:00 PM)',
  'Evening (6:00 PM – 10:00 PM)'
];

const CHANGE_OPTIONS = [
  'I will have exact cash ready',
  'Need change for AED 500 note',
  'Need change for AED 1000 note',
  'Will pay with Card on Delivery (POS Machine)'
];

const CashOnDeliveryModal = () => {
  const navigate = useNavigate();
  const {
    codModalProduct,
    closeCodModal,
    user,
    createOrder,
    triggerToast
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cash on Delivery specific form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+971 ',
    altPhone: '',
    emirate: 'Dubai',
    area: '',
    street: '',
    landmark: '',
    deliveryTime: 'Anytime (Fastest Dispatch)',
    changeNote: 'I will have exact cash ready',
    instructions: ''
  });

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (codModalProduct) {
      setQuantity(codModalProduct.selectedQuantity || 1);
      setFormData((prev) => ({
        ...prev,
        fullName: user?.name || prev.fullName || '',
        email: user?.email || prev.email || '',
        phone: user?.phone || (prev.phone === '+971 ' ? '+971 ' : prev.phone),
        street: user?.addresses?.[0]?.street || prev.street || '',
        area: user?.addresses?.[0]?.city || prev.area || '',
        emirate: user?.addresses?.[0]?.state || 'Dubai'
      }));
    }
  }, [codModalProduct, user]);

  if (!codModalProduct) return null;

  const activePrice = codModalProduct.discountPrice || codModalProduct.price || 0;
  const subtotal = activePrice * quantity;
  const shipping = subtotal > 150 ? 0 : 15.00;
  const finalTotal = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      triggerToast('Please enter your full receiver name.', 'warning');
      return;
    }

    const cleanPhone = formData.phone.trim();
    if (!cleanPhone || cleanPhone === '+971' || cleanPhone.length < 9) {
      triggerToast('Please provide a valid UAE mobile number for the delivery rider.', 'warning');
      return;
    }

    if (!formData.area.trim()) {
      triggerToast('Please enter your Area / Neighborhood (e.g. Downtown Dubai).', 'warning');
      return;
    }

    if (!formData.street.trim()) {
      triggerToast('Please enter your Building Name, Villa or Flat number.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingDetails = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        altPhone: formData.altPhone.trim(),
        emirate: formData.emirate,
        area: formData.area.trim(),
        street: formData.street.trim(),
        landmark: formData.landmark.trim(),
        deliveryTime: formData.deliveryTime,
        changeNote: formData.changeNote,
        instructions: formData.instructions.trim(),
        city: formData.area.trim() || formData.emirate,
        state: formData.emirate,
        country: 'United Arab Emirates',
        zip: '00000'
      };

      const paymentPayload = {
        method: 'Cash on Delivery',
        details: `Doorstep Cash on Delivery in ${formData.emirate}. Change: ${formData.changeNote}. Time: ${formData.deliveryTime}`,
        status: 'Pending (Pay upon arrival)'
      };

      const orderItem = {
        id: codModalProduct.id,
        name: codModalProduct.name,
        price: codModalProduct.price,
        discountPrice: codModalProduct.discountPrice,
        image: codModalProduct.image || (codModalProduct.images && codModalProduct.images[0]) || '',
        quantity,
        color: codModalProduct.selectedColor || 'Standard',
        size: codModalProduct.selectedSize || 'Standard'
      };

      // Create Order via context
      const orderId = await createOrder(shippingDetails, paymentPayload, [orderItem], finalTotal);

      closeCodModal();
      navigate(`/order-success?id=${orderId}&method=cod`);
    } catch (err) {
      triggerToast('Failed to place order: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full my-auto p-5 sm:p-7 shadow-2xl space-y-5 text-left max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <RiHandCoinLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cash on Delivery (Doorstep Order)
              </h3>
              <p className="text-xs text-slate-400">
                Apna order place karein — payment delivery ke waqt cash ya card se karein
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCodModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Summary Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
          {(codModalProduct.image || (codModalProduct.images && codModalProduct.images[0])) ? (
            <img
              src={codModalProduct.image || codModalProduct.images[0]}
              alt={codModalProduct.name}
              className="w-16 h-16 rounded-xl object-cover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
              <RiHandCoinLine className="w-7 h-7 text-emerald-600 opacity-60" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {codModalProduct.brand || 'VANTA DUBAI'}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {codModalProduct.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                AED {activePrice.toFixed(2)}
              </span>
              {codModalProduct.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  AED {codModalProduct.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector inside modal */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shrink-0">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
            >
              <RiSubtractLine className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold px-1.5 text-slate-800 dark:text-slate-100">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= (codModalProduct.stock || 99)}
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
            >
              <RiAddLine className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* COD Benefits Guarantee Bar */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <RiTruckLine className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>24-48h UAE Delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RiHandCoinLine className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Pay on Doorstep</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RiShieldCheckLine className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Inspect Before Pay</span>
          </div>
        </div>

        {/* Form Inputs for Cash on Delivery */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Full Name (Receiver's Name) *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Mohammed Al Mansoori"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Mobile Number (Rider Call & WhatsApp) *
              </label>
              <div className="relative">
                <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+971 50 123 4567"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Alternative Phone */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Alternative Phone (Optional)
              </label>
              <input
                type="tel"
                name="altPhone"
                value={formData.altPhone}
                onChange={handleChange}
                placeholder="+971 55 987 6543"
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Emirate Selection */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Emirate (City) *
              </label>
              <select
                name="emirate"
                value={formData.emirate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {UAE_EMIRATES.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>

            {/* Area / Neighborhood */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Area / Neighborhood *
              </label>
              <input
                type="text"
                name="area"
                required
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g. Downtown, Marina, Business Bay, Deira"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Street / Building & Flat */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Building Name, Street & Apartment / Villa # *
              </label>
              <input
                type="text"
                name="street"
                required
                value={formData.street}
                onChange={handleChange}
                placeholder="e.g. Marina Gate Tower 1, Flat 1204, Al Marsa Street"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Nearest Landmark */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Nearest Landmark (Optional)
              </label>
              <div className="relative">
                <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Opposite Mall, Near Metro"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Preferred Delivery Time */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Preferred Delivery Time Slot
              </label>
              <div className="relative">
                <RiTimeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {DELIVERY_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cash Change Note */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Cash Change Note for Rider
              </label>
              <div className="relative">
                <RiMoneyDollarCircleLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  name="changeNote"
                  value={formData.changeNote}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {CHANGE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Driver Instructions */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <textarea
                name="instructions"
                rows="2"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="e.g. Call before coming, or leave with building security if not answering."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Price Breakdown Footer & Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">AED {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>UAE Delivery (Standard)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {shipping === 0 ? 'FREE' : `AED ${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white pt-1">
              <span>Total Payable at Doorstep:</span>
              <span className="text-xl text-emerald-600 dark:text-emerald-400">
                AED {finalTotal.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <RiHandCoinLine className="w-5 h-5" />
              {isSubmitting ? 'Placing COD Order...' : `Confirm Cash on Delivery (Pay AED ${finalTotal.toFixed(2)})`}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-1">
              🔒 No advance payment needed. 100% Cash on Delivery across Dubai & UAE.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashOnDeliveryModal;

