import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  RiChat1Line,
  RiCloseLine,
  RiSendPlane2Fill,
  RiRobot2Line,
  RiTimeLine,
  RiTruckLine,
  RiCheckDoubleLine,
  RiCloseCircleLine,
  RiShoppingBag3Line,
  RiMapPinLine,
  RiExternalLinkLine,
  RiRefreshLine,
  RiQuestionLine
} from 'react-icons/ri';

const OrderChatbot = () => {
  const { orders = [], user } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Hello! I am your Vanta Dubai Order Tracking Assistant. Please enter your Order ID (e.g. ORD-628773) below to check the real-time status and complete details of your order.',
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages]);

  // Extract order ID from arbitrary user input
  const extractOrderId = (text) => {
    if (!text) return null;
    const clean = text.trim();
    // Match patterns like ORD-628773, ORD-RETRY-790148, or 6 digit number
    const ordMatch = clean.match(/ORD-[A-Z0-9-]+/i);
    if (ordMatch) return ordMatch[0].toUpperCase();
    
    const numMatch = clean.match(/\b\d{5,8}\b/);
    if (numMatch) return `ORD-${numMatch[0]}`;

    // If user typed only alphanumeric that looks like an ID
    if (/^[A-Z0-9-]{4,20}$/i.test(clean) && !['HELLO', 'SALAM', 'HELP', 'TRACK'].includes(clean.toUpperCase())) {
      return clean.toUpperCase().startsWith('ORD-') ? clean.toUpperCase() : `ORD-${clean.toUpperCase()}`;
    }

    return null;
  };

  // Status explanation helper
  const getStatusExplanation = (status) => {
    const s = (status || 'PROCESSING').toUpperCase();
    if (s === 'PROCESSING') {
      return {
        badge: 'Under Processing',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        icon: RiTimeLine,
        desc: 'Your order has been received and is currently being packed and prepared at our fulfillment center.'
      };
    }
    if (s === 'SHIPPED') {
      return {
        badge: 'Shipped & In Transit',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
        icon: RiTruckLine,
        desc: 'Your parcel has been dispatched with our courier partner and is currently on its way to you.'
      };
    }
    if (s === 'DELIVERED') {
      return {
        badge: 'Delivered',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        icon: RiCheckDoubleLine,
        desc: 'Your order has been successfully delivered to your address. Thank you for shopping with Vanta Dubai!'
      };
    }
    if (s === 'CANCELLED') {
      return {
        badge: 'Cancelled',
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        icon: RiCloseCircleLine,
        desc: 'This order has been cancelled. For any inquiries or assistance, please reach out to our customer support.'
      };
    }
    return {
      badge: status,
      color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300',
      icon: RiTimeLine,
      desc: 'Order status: ' + status
    };
  };

  // Perform lookup against local orders state & backend API
  const lookupOrder = async (orderIdToFind) => {
    // 1. Try local orders first
    if (Array.isArray(orders) && orders.length > 0) {
      const found = orders.find(
        (o) =>
          String(o.orderId || o.id).toUpperCase() === orderIdToFind.toUpperCase() ||
          String(o.orderId || o.id).toUpperCase().replace('ORD-', '') === orderIdToFind.toUpperCase().replace('ORD-', '')
      );
      if (found) return found;
    }

    // 2. Fetch directly from backend API
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderIdToFind)}`, { credentials: 'include' });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (data.success && data.order) {
            return data.order;
          }
        }
      }
    } catch (_) {}

    return null;
  };

  const handleSendMessage = async (customText = null) => {
    const rawText = customText || inputValue;
    if (!rawText || !rawText.trim() || isLoading) return;

    const userText = rawText.trim();
    setInputValue('');

    // Append user message
    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate smart thinking delay
    setTimeout(async () => {
      const extractedId = extractOrderId(userText);

      // Check common inquiries
      const lower = userText.toLowerCase();
      if (!extractedId) {
        if (lower.includes('salam') || lower.includes('hello') || lower.includes('hi')) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              text: 'Hello! Please enter your Order ID (e.g. ORD-628773) so I can instantly check your live order status.',
              timestamp: new Date()
            }
          ]);
        } else if (lower.includes('kahan') || lower.includes('kdr') || lower.includes('where') || lower.includes('mil') || lower.includes('find')) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              text: 'You can find your Order ID on the order confirmation screen after checkout, or in your confirmation email/SMS (e.g. ORD-628773).\n\nYou can also find it under your "My Orders" page.',
              timestamp: new Date()
            }
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              text: 'I could not recognize that Order ID. Please enter your Order ID in this format: ORD-628773 (or enter your 6-digit order number).',
              timestamp: new Date()
            }
          ]);
        }
        setIsLoading(false);
        return;
      }

      // If we got an order ID, fetch status
      const order = await lookupOrder(extractedId);

      if (order) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: `Order #${order.orderId || order.id} found! Here is the live status and order details:`,
            orderData: order,
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: `Sorry! Order ID "${extractedId}" was not found in our records. Please verify your Order ID or check your "My Orders" page.`,
            timestamp: new Date()
          }
        ]);
      }
      setIsLoading(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Recent sample order from store orders for quick chip testing
  const sampleOrder = orders && orders.length > 0 ? orders[0] : null;

  return (
    <>
      {/* Floating Trigger Button on Bottom-Right */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 select-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="relative flex items-center"
            >
              {/* Peek prompt badge */}
              <div 
                onClick={() => setIsOpen(true)}
                className="hidden sm:flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:scale-105 transition-transform"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Track Your Order</span>
              </div>

              {/* Main Button */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-primary-600 to-primary-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-hidden ring-4 ring-primary-500/20"
                aria-label="Open Order Tracking Chatbot"
              >
                <RiChat1Line className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chatbot Window Modal / Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[390px] h-[540px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-left"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <RiRobot2Line className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight flex items-center gap-1.5">
                    Order Assistant
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-primary-100 font-medium">Vanta Dubai Live Order Tracker</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
                aria-label="Close Chat"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/50 dark:bg-slate-950/20">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                        isBot
                          ? 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800/80 shadow-xs'
                          : 'bg-primary-600 text-white shadow-xs rounded-br-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line font-medium text-[12px]">{msg.text}</p>

                      {/* If message has rich order card */}
                      {msg.orderData && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-left space-y-2.5">
                          {(() => {
                            const ord = msg.orderData;
                            const explanation = getStatusExplanation(ord.status);
                            const StatusIcon = explanation.icon;
                            const items = Array.isArray(ord.items) ? ord.items : [];
                            const totalAmount = Number(ord.totals?.total ?? ord.totalAmount ?? 0);
                            const customerName = ord.shippingDetails?.fullName || ord.customerName || 'Valued Customer';
                            const orderId = ord.orderId || ord.id;

                            return (
                              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200/70 dark:border-slate-800 space-y-2">
                                {/* Order ID & Status Banner */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                    {orderId}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${explanation.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {explanation.badge}
                                  </span>
                                </div>

                                {/* Status explanation in Urdu/English */}
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/60 leading-normal">
                                  {explanation.desc}
                                </p>

                                {/* Customer & Address details */}
                                <div className="text-[11px] text-slate-500 space-y-0.5">
                                  <p><strong>Customer:</strong> {customerName}</p>
                                  <p className="truncate"><strong>Address:</strong> {ord.shippingDetails?.street || ord.shippingAddress || 'Dubai, UAE'}</p>
                                  <p><strong>Date Placed:</strong> {ord.date || 'Recent'}</p>
                                </div>

                                {/* Items mini list */}
                                {items.length > 0 && (
                                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Items ({items.length}):</p>
                                    <div className="space-y-1">
                                      {items.slice(0, 2).map((it, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-[11px]">
                                          <span className="truncate max-w-[160px] text-slate-700 dark:text-slate-300">
                                            {it.quantity || 1}x {it.name}
                                          </span>
                                          <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                                            AED {Number(it.discountPrice || it.price || 0).toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                      {items.length > 2 && (
                                        <p className="text-[10px] text-slate-400">+{items.length - 2} more items</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Grand Total */}
                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 font-bold text-xs text-slate-900 dark:text-white">
                                  <span>Total Amount:</span>
                                  <span className="text-primary-600 dark:text-primary-400">
                                    AED {totalAmount.toFixed(2)}
                                  </span>
                                </div>

                                {/* Link to Orders page with specific Order ID */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsOpen(false);
                                    const targetId = orderId || ord.orderId || ord.id || '';
                                    navigate(targetId ? `/orders?orderId=${encodeURIComponent(targetId)}` : '/orders');
                                  }}
                                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                                >
                                  <span>View in Order History</span>
                                  <RiExternalLinkLine className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-2xl w-fit shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-slate-400 ml-1">Checking order status...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick action chips (e.g. sample order or help) */}
            <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-850/60 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {sampleOrder && (
                <button
                  type="button"
                  onClick={() => handleSendMessage(sampleOrder.orderId || sampleOrder.id)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap hover:bg-primary-50 dark:hover:bg-primary-950/40 cursor-pointer shadow-2xs"
                >
                  Track #{sampleOrder.orderId || sampleOrder.id}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSendMessage('Where do I find my Order ID?')}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Where is my Order ID?
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your Order ID (e.g. ORD-628773)..."
                  className="flex-grow px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-9 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
                  aria-label="Send Order ID"
                >
                  <RiSendPlane2Fill className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrderChatbot;
