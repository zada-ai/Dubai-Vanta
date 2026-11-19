import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { 
  RiSecurePaymentLine, 
  RiTruckLine, 
  RiWallet3Line, 
  RiArrowRightLine,
  RiMoneyDollarCircleLine,
  RiHandCoinLine,
  RiShieldCheckLine,
  RiCheckLine,
  RiMapPinLine,
  RiTimeLine,
  RiPhoneLine
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

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cart,
    user,
    getCartSubtotal,
    getCartDiscount,
    getShippingCost,
    getTaxAmount,
    getCartTotal,
    createOrder,
    triggerToast
  } = useApp();

  // Set default shipping form details (UAE & Dubai default)
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+971 ',
    altPhone: '',
    emirate: user?.addresses?.[0]?.state || 'Dubai',
    area: user?.addresses?.[0]?.city || '',
    street: user?.addresses?.[0]?.street || '',
    landmark: '',
    deliveryTime: 'Anytime (Fastest Dispatch)',
    changeNote: 'I will have exact cash ready',
    instructions: '',
    city: user?.addresses?.[0]?.city || 'Dubai',
    state: user?.addresses?.[0]?.state || 'Dubai',
    zip: '00000',
    country: 'United Arab Emirates'
  });

  const [deliveryMethod, setDeliveryMethod] = useState('standard'); // standard (free/15) vs express (25)
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' (Cash on Delivery) vs 'card' (Credit/Debit Card)
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });


  // If cart is empty, redirect to shop
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/shop" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold">
          Go to Shop
        </Link>
      </div>
    );
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const calculateFinalShipping = () => {
    const baseShipping = getShippingCost();
    return deliveryMethod === 'express' ? baseShipping + 25.00 : baseShipping;
  };

  const calculateFinalTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const shipping = calculateFinalShipping();
    const tax = getTaxAmount();
    return Math.max(0, subtotal - discount + shipping + tax);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validation for Doorstep Delivery in UAE
    if (!shippingDetails.fullName.trim()) {
      triggerToast('Please enter your full receiver name.', 'warning');
      return;
    }

    const cleanPhone = (shippingDetails.phone || '').trim();
    if (!cleanPhone || cleanPhone === '+971' || cleanPhone.length < 9) {
      triggerToast('Please provide a valid UAE mobile number for the delivery rider.', 'warning');
      return;
    }

    if (!shippingDetails.area.trim()) {
      triggerToast('Please enter your Area / Neighborhood (e.g. Downtown Dubai).', 'warning');
      return;
    }

    if (!shippingDetails.street.trim()) {
      triggerToast('Please enter your Building Name, Villa or Flat number.', 'warning');
      return;
    }

    if (paymentMethod === 'card') {
      const requiredPaymentFields = ['cardName', 'cardNumber', 'cardExpiry', 'cardCvv'];
      const isPaymentValid = requiredPaymentFields.every((field) => (paymentDetails[field] || '').trim() !== '');
      if (!isPaymentValid) {
        triggerToast('Please fill out your billing card details.', 'warning');
        return;
      }
    }

    // Call Context action to clear cart and create order
    const paymentPayload = paymentMethod === 'cod'
      ? {
          method: 'Cash on Delivery',
          details: `Doorstep Cash on Delivery in ${shippingDetails.emirate}. Change: ${shippingDetails.changeNote}. Time: ${shippingDetails.deliveryTime}`,
          status: 'Pending (Pay upon arrival)'
        }
      : {
          method: 'Credit Card',
          cardNumber: `•••• •••• •••• ${paymentDetails.cardNumber.slice(-4) || '4321'}`,
          status: 'Paid'
        };

    const finalShippingDetails = {
      ...shippingDetails,
      city: shippingDetails.area.trim() || shippingDetails.emirate,
      state: shippingDetails.emirate,
      country: 'United Arab Emirates'
    };

    const orderId = await createOrder(finalShippingDetails, paymentPayload);

    // Redirect to success screen with method param
    navigate(`/order-success?id=${orderId}&method=${paymentMethod}`);
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Page Breadcrumb */}
      <Breadcrumb
        items={[
          { name: 'Cart', path: '/cart' },
          { name: 'Checkout' }
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white text-left mb-2">
        Checkout Shipping & Billing
      </h1>

      {!user && (
        <p className="text-xs sm:text-sm text-left text-slate-500 dark:text-slate-400 -mt-1">
          You are ordering as a guest — no account needed.{' '}
          <Link to="/login?redirect=checkout" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
            Log in
          </Link>{' '}
          if you already have one.
        </p>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
        {/* Left Column: Form Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8 text-left">
          
          {/* Shipping Address section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <RiTruckLine className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Shipping Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Receiver's Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingDetails.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Mohammed Al Mansoori"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                />
              </div>

              {/* UAE Mobile */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  UAE Mobile / WhatsApp * (For Rider)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingDetails.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+971 50 123 4567"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                />
              </div>

              {/* Alternate Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Alternative Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="altPhone"
                  value={shippingDetails.altPhone}
                  onChange={handleInputChange}
                  placeholder="+971 55 987 6543"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address (For Invoice & Order Tracking)
                </label>
                <input
                  type="email"
                  name="email"
                  value={shippingDetails.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                />
              </div>

              {/* Emirate Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Emirate (State) *
                </label>
                <select
                  name="emirate"
                  value={shippingDetails.emirate}
                  onChange={handleInputChange}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100 font-semibold cursor-pointer"
                >
                  {UAE_EMIRATES.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area / Neighborhood */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Area / Neighborhood *
                </label>
                <input
                  type="text"
                  name="area"
                  value={shippingDetails.area}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Downtown Dubai / Marina / JVC"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                />
              </div>

              {/* Building & Street & Apartment */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Building Name, Street & Apartment / Villa # *
                </label>
                <input
                  type="text"
                  name="street"
                  value={shippingDetails.street}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Marina Gate Tower 1, Flat 1402, Al Marsa St"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                />
              </div>

              {/* Landmark */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nearest Landmark (Helps Rider find location fast)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={shippingDetails.landmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Opposite Dubai Mall / Near Metro Station"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                />
              </div>

              {/* Preferred Delivery Time */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Preferred Delivery Time Slot
                </label>
                <select
                  name="deliveryTime"
                  value={shippingDetails.deliveryTime}
                  onChange={handleInputChange}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100 font-semibold cursor-pointer"
                >
                  {DELIVERY_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cash on Delivery Note */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cash on Delivery Note
                </label>
                <select
                  name="changeNote"
                  value={shippingDetails.changeNote}
                  onChange={handleInputChange}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100 font-semibold cursor-pointer"
                >
                  {CHANGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Instructions */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Delivery Instructions for Courier Rider
                </label>
                <input
                  type="text"
                  name="instructions"
                  value={shippingDetails.instructions}
                  onChange={handleInputChange}
                  placeholder="e.g. Ring bell twice, leave with security if unavailable"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <RiTruckLine className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delivery Method</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Standard */}
              <button
                type="button"
                onClick={() => setDeliveryMethod('standard')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                  deliveryMethod === 'standard'
                    ? 'border-slate-900 bg-slate-50/50 dark:border-white dark:bg-slate-900'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === 'standard'}
                  onChange={() => {}}
                  className="mt-1 cursor-pointer accent-slate-950 dark:accent-white"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Standard Delivery</span>
                  <span className="text-xs text-slate-400 mt-0.5">3-5 Business Days</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-250 mt-2">
                    {getShippingCost() === 0 ? 'Free' : `AED ${getShippingCost().toFixed(2)}`}
                  </span>
                </div>
              </button>

              {/* Express */}
              <button
                type="button"
                onClick={() => setDeliveryMethod('express')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                  deliveryMethod === 'express'
                    ? 'border-slate-900 bg-slate-50/50 dark:border-white dark:bg-slate-900'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === 'express'}
                  onChange={() => {}}
                  className="mt-1 cursor-pointer accent-slate-950 dark:accent-white"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Express Delivery</span>
                  <span className="text-xs text-slate-400 mt-0.5">1-2 Business Days</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-250 mt-2">
                    + AED 25.00
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Method section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RiWallet3Line className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Method</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                UAE Delivery Available
              </span>
            </div>

            {/* Payment Method Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Cash on Delivery (COD) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer relative overflow-hidden ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                }`}
              >
                <div className="mt-1">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-emerald-600 cursor-pointer w-4 h-4"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <RiHandCoinLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pay with cash in AED upon doorstep delivery across UAE.
                  </span>
                  <span className="mt-2 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 w-fit px-2 py-0.5 rounded-md">
                    ✓ Recommended
                  </span>
                </div>
              </button>

              {/* Option 2: Credit / Debit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer relative overflow-hidden ${
                  paymentMethod === 'card'
                    ? 'border-slate-900 dark:border-white bg-slate-50/50 dark:bg-slate-900 ring-2 ring-slate-900/20 dark:ring-white/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                }`}
              >
                <div className="mt-1">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-slate-900 dark:accent-white cursor-pointer w-4 h-4"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <RiSecurePaymentLine className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    Credit / Debit Card
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pay online with Visa, Mastercard, or AMEX.
                  </span>
                  <span className="mt-2 text-[10px] font-bold text-slate-400">
                    100% Encrypted Checkout
                  </span>
                </div>
              </button>
            </div>

            {/* COD Explanation Notice Banner */}
            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <RiMoneyDollarCircleLine className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-xs text-slate-650 dark:text-slate-300">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    Cash on Delivery is Active
                  </span>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                    No card details needed. Please keep <strong className="text-slate-900 dark:text-white">AED {calculateFinalTotal().toFixed(2)}</strong> in cash ready when our courier rider delivers to your doorstep in the UAE.
                  </p>
                </div>
              </div>
            )}

            {/* Credit Card inputs (shown only when card selected) */}
            {paymentMethod === 'card' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1 sm:col-span-4">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={paymentDetails.cardName}
                      onChange={handlePaymentChange}
                      required={paymentMethod === 'card'}
                      placeholder="Jane Doe"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentChange}
                      required={paymentMethod === 'card'}
                      maxLength="16"
                      placeholder="4111 2222 3333 4444"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={paymentDetails.cardExpiry}
                      onChange={handlePaymentChange}
                      required={paymentMethod === 'card'}
                      placeholder="12/29"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CVV</label>
                    <input
                      type="password"
                      name="cardCvv"
                      value={paymentDetails.cardCvv}
                      onChange={handlePaymentChange}
                      required={paymentMethod === 'card'}
                      maxLength="3"
                      placeholder="123"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Checkout Summary</h3>

            {/* Cart products check */}
            <div className="flex flex-col gap-3.5 mb-5 max-h-[180px] overflow-y-auto pr-2 border-b border-slate-100 dark:border-slate-800 pb-5">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-50 dark:bg-slate-950"
                  />
                  <div className="flex-grow min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</h5>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} • {item.color}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    AED {((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary list */}
            <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5 text-sm font-semibold text-slate-650 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white">AED {getCartSubtotal().toFixed(2)}</span>
              </div>

              {getCartDiscount() > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-500">
                  <span>Coupon Discount</span>
                  <span>-AED {getCartDiscount().toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {calculateFinalShipping() === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold uppercase text-xs">Free</span>
                  ) : (
                    `AED ${calculateFinalShipping().toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="text-slate-900 dark:text-white">AED {getTaxAmount().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-500">Payment</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {paymentMethod === 'cod' ? (
                    <>
                      <RiHandCoinLine className="w-3.5 h-3.5" /> Cash on Delivery
                    </>
                  ) : (
                    <>
                      <RiSecurePaymentLine className="w-3.5 h-3.5" /> Credit/Debit Card
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-baseline mb-6">
              <span className="font-bold text-slate-800 dark:text-slate-200">Final Total</span>
              <span className="text-xl md:text-2xl font-black text-slate-950 dark:text-white">
                AED {calculateFinalTotal().toFixed(2)}
              </span>
            </div>

            {/* Place Order CTA - Dynamic for COD or Card */}
            {paymentMethod === 'cod' ? (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all shadow-md hover:shadow-lg cursor-pointer text-sm"
              >
                <RiHandCoinLine className="w-5 h-5" />
                Place Order (Cash on Delivery)
                <RiArrowRightLine className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-bold transition-all shadow-md hover:shadow-lg cursor-pointer text-sm"
              >
                <RiSecurePaymentLine className="w-5 h-5" />
                Pay & Place Order
                <RiArrowRightLine className="w-4 h-4 ml-1" />
              </button>
            )}

            <p className="text-[11px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
              <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-500" />
              Safe & Secure Checkout • Dubai, UAE
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
