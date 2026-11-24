import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import Breadcrumb from '../components/Breadcrumb';
import { 
  RiFileList3Line, 
  RiArrowDownSLine, 
  RiArrowUpSLine, 
  RiDownload2Line,
  RiMapPinLine,
  RiBankCardLine,
  RiRefreshLine,
  RiSearchLine,
  RiFilter3Line,
  RiShieldUserLine,
  RiShoppingBag3Line,
  RiTimeLine,
  RiCheckDoubleLine,
  RiTruckLine,
  RiCloseCircleLine
} from 'react-icons/ri';

const Orders = () => {
  const { orders = [], user, fetchOrdersFromApi, triggerToast } = useApp();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [adminViewScope, setAdminViewScope] = useState('ALL'); // 'ALL' = all store orders, 'MINE' = only current admin's orders

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    return role === 'admin' || role === 'superadmin' || role === 'super_admin' || role === 'super administrator';
  }, [user]);

  // Sync on component mount
  useEffect(() => {
    if (fetchOrdersFromApi) {
      fetchOrdersFromApi();
    }
  }, []);

  const handleManualRefresh = async () => {
    if (!fetchOrdersFromApi) return;
    setIsRefreshing(true);
    try {
      await fetchOrdersFromApi();
      if (triggerToast) triggerToast('Order history synced with database', 'success');
    } catch (_) {
      if (triggerToast) triggerToast('Could not refresh orders', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Generate and print/download clean HTML invoice
  const handleDownloadInvoice = (order, e) => {
    e.stopPropagation();
    const orderId = order.orderId || order.id || 'ORDER';
    const customerName = order.shippingDetails?.fullName || order.customerName || 'Valued Customer';
    const customerEmail = order.shippingDetails?.email || order.customerEmail || '';
    const customerPhone = order.shippingDetails?.phone || order.customerPhone || '';
    const address = [
      order.shippingDetails?.street || (typeof order.shippingAddress === 'string' && !order.shippingAddress.startsWith('{') ? order.shippingAddress : ''),
      order.shippingDetails?.city,
      order.shippingDetails?.state,
      order.shippingDetails?.zip,
      order.shippingDetails?.country
    ].filter(Boolean).join(', ') || 'Dubai, United Arab Emirates';

    const orderDate = order.date || 'Recent';
    const items = Array.isArray(order.items) ? order.items : [];
    const totalAmount = Number(order.totals?.total ?? order.totalAmount ?? 0);
    const subtotal = Number(order.totals?.subtotal ?? totalAmount);
    const discount = Number(order.totals?.discount ?? 0);
    const shipping = Number(order.totals?.shipping ?? 0);
    const tax = Number(order.totals?.tax ?? 0);
    const paymentMethodText = typeof order.paymentMethod === 'string' 
      ? order.paymentMethod 
      : (order.paymentMethod?.method || 'Cash on Delivery (AED)');

    const itemsHtml = items.map((item, idx) => {
      const price = Number(item.discountPrice || item.price || 0);
      const qty = Number(item.quantity || 1);
      const rowTotal = price * qty;
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px; text-align: center; color: #64748b;">${idx + 1}</td>
          <td style="padding: 12px 8px; font-weight: 600; color: #1e293b;">
            ${item.name || 'Product Item'}
            <div style="font-size: 11px; color: #94a3b8; font-weight: normal; margin-top: 2px;">
              ${item.color ? `Color: ${item.color}` : ''} ${item.size && item.size !== 'Standard' ? `| Size: ${item.size}` : ''}
            </div>
          </td>
          <td style="padding: 12px 8px; text-align: center; color: #475569;">${qty}</td>
          <td style="padding: 12px 8px; text-align: right; color: #475569;">AED ${price.toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #0f172a;">AED ${rowTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${orderId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; color: #0f172a; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
          .brand { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
          .brand span { color: #8b5cf6; }
          .invoice-tag { font-size: 20px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: right; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; font-size: 13px; }
          .meta-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
          table { width: 100%; border-collapse: collapse; margin-top: 28px; font-size: 13px; }
          th { background: #f8fafc; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
          .totals-wrap { display: flex; justify-content: flex-end; margin-top: 24px; }
          .totals-table { width: 280px; font-size: 13px; }
          .totals-table tr td { padding: 6px 0; }
          .grand-total { font-size: 16px; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 10px !important; }
          .footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
          @media print {
            body { padding: 16px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">AERO<span>STORE</span></div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium Lifestyle & Luxury Goods • Dubai, UAE</div>
            <div style="font-size: 12px; color: #64748b;">support@aerostore.com • +971 4 123 4567</div>
          </div>
          <div class="invoice-tag">
            Invoice
            <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 4px; font-family: monospace;">#${orderId}</div>
            <div style="font-size: 12px; font-weight: 500; color: #64748b;">Date: ${orderDate}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <h4>Billed & Shipped To:</h4>
            <div style="font-weight: 700; font-size: 14px;">${customerName}</div>
            ${customerEmail ? `<div>${customerEmail}</div>` : ''}
            ${customerPhone ? `<div>${customerPhone}</div>` : ''}
            <div style="color: #475569; margin-top: 4px;">${address}</div>
          </div>
          <div class="meta-box" style="text-align: right;">
            <h4>Order Details:</h4>
            <div><strong>Status:</strong> ${order.status || 'Processing'}</div>
            <div><strong>Payment Method:</strong> ${paymentMethodText}</div>
            <div><strong>Currency:</strong> AED (United Arab Emirates Dirham)</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center; width: 40px;">#</th>
              <th>Item Description</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 100px;">Unit Price</th>
              <th style="text-align: right; width: 110px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="5" style="text-align:center; padding: 20px;">No items listed</td></tr>'}
          </tbody>
        </table>

        <div class="totals-wrap">
          <table class="totals-table">
            <tr>
              <td style="color: #64748b;">Subtotal:</td>
              <td style="text-align: right; font-weight: 600;">AED ${subtotal.toFixed(2)}</td>
            </tr>
            ${discount > 0 ? `
            <tr>
              <td style="color: #10b981;">Coupon Discount:</td>
              <td style="text-align: right; font-weight: 600; color: #10b981;">-AED ${discount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="color: #64748b;">Shipping:</td>
              <td style="text-align: right; font-weight: 600;">${shipping === 0 ? 'FREE' : `AED ${shipping.toFixed(2)}`}</td>
            </tr>
            ${tax > 0 ? `
            <tr>
              <td style="color: #64748b;">Tax / VAT (5%):</td>
              <td style="text-align: right; font-weight: 600;">AED ${tax.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr class="grand-total">
              <td>Total Amount:</td>
              <td style="text-align: right;">AED ${totalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          Thank you for shopping with AeroStore Dubai! For inquiries or support, please email support@aerostore.com.<br/>
          This is an official computer-generated receipt.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
    } else {
      if (triggerToast) triggerToast('Pop-up blocked. Please allow pop-ups to print invoice.', 'warning');
    }
  };

  // Filter orders based on user role, search, and status
  const visibleOrders = useMemo(() => {
    let list = Array.isArray(orders) ? [...orders] : [];

    // Filter by user role scope
    if (!isAdmin) {
      // Normal customer only sees their orders
      if (user) {
        list = list.filter((o) => {
          if (o.userId && user.id && String(o.userId) === String(user.id)) return true;
          if (o.customerEmail && user.email && o.customerEmail.toLowerCase() === user.email.toLowerCase()) return true;
          if (o.shippingDetails?.email && user.email && o.shippingDetails.email.toLowerCase() === user.email.toLowerCase()) return true;
          return false;
        });
      }
    } else {
      // Admin / Super Admin
      if (adminViewScope === 'MINE' && user) {
        list = list.filter((o) => {
          if (o.userId && user.id && String(o.userId) === String(user.id)) return true;
          if (o.customerEmail && user.email && o.customerEmail.toLowerCase() === user.email.toLowerCase()) return true;
          return false;
        });
      }
    }

    // Filter by status tab
    if (statusFilter !== 'ALL') {
      list = list.filter((o) => (o.status || '').toUpperCase() === statusFilter);
    }

    // Filter by search query (orderId, customer name, items)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((o) => {
        const idMatch = (o.orderId || o.id || '').toLowerCase().includes(q);
        const nameMatch = (o.shippingDetails?.fullName || o.customerName || '').toLowerCase().includes(q);
        const emailMatch = (o.shippingDetails?.email || o.customerEmail || '').toLowerCase().includes(q);
        const itemMatch = Array.isArray(o.items) && o.items.some((it) => (it.name || '').toLowerCase().includes(q));
        return idMatch || nameMatch || emailMatch || itemMatch;
      });
    }

    return list;
  }, [orders, user, isAdmin, adminViewScope, statusFilter, searchTerm]);

  // Helper for status badge colors
  const getStatusBadge = (status) => {
    const s = (status || 'PROCESSING').toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
          <RiCheckDoubleLine className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    }
    if (s === 'SHIPPED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-800/40">
          <RiTruckLine className="w-3.5 h-3.5" /> Shipped
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 px-2.5 py-1 rounded-full border border-rose-200/50 dark:border-rose-800/40">
          <RiCloseCircleLine className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/40">
        <RiTimeLine className="w-3.5 h-3.5" /> Processing
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5 py-4 max-w-6xl mx-auto w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ name: 'My Orders', path: '/orders' }]} />

      {/* Header Section with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Order History
            </h1>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                <RiShieldUserLine className="w-3.5 h-3.5" /> Admin View
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin 
              ? 'View and manage all real-time customer orders placed on AeroStore.' 
              : 'Track package statuses, review shipping addresses, and download official invoices.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Admin toggle between all store orders and personal orders */}
          {isAdmin && (
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAdminViewScope('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  adminViewScope === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setAdminViewScope('MINE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  adminViewScope === 'MINE'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                My Orders
              </button>
            </div>
          )}

          {/* Refresh Orders Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Sync with database"
          >
            <RiRefreshLine className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-violet-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PROCESSING', label: 'Processing' },
            { id: 'SHIPPED', label: 'Shipped' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'CANCELLED', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-grow max-w-md">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, customer, item..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/40"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders List Rendering */}
      {visibleOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-10 text-center shadow-xs">
          {orders.length === 0 ? (
            <EmptyState type="orders" buttonLink="/shop" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <RiFilter3Line className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No orders match your filter
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Try clearing your search term or selecting another status tab above.
              </p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 text-left">
          {visibleOrders.map((order) => {
            const orderId = order.orderId || order.id || 'ORD-UNKNOWN';
            const isExpanded = expandedOrderId === orderId;
            const items = Array.isArray(order.items) ? order.items : [];
            const totalItemsCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
            const totalAmount = Number(order.totals?.total ?? order.totalAmount ?? 0);
            const customerName = order.shippingDetails?.fullName || order.customerName || 'Valued Customer';
            const customerEmail = order.shippingDetails?.email || order.customerEmail || '';
            const customerPhone = order.shippingDetails?.phone || order.customerPhone || '';
            const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent');

            // Format address
            const addressParts = [
              order.shippingDetails?.street || (typeof order.shippingAddress === 'string' && !order.shippingAddress.startsWith('{') ? order.shippingAddress : ''),
              order.shippingDetails?.city,
              order.shippingDetails?.state,
              order.shippingDetails?.zip,
              order.shippingDetails?.country
            ].filter(Boolean);
            const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Dubai, United Arab Emirates';

            return (
              <div
                key={orderId}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => toggleOrderExpand(orderId)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 flex-grow w-full sm:w-auto">
                    {/* Order ID & Customer */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                        {orderId}
                      </span>
                      {isAdmin && customerName && (
                        <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          👤 {customerName}
                        </span>
                      )}
                    </div>

                    {/* Date Placed */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Placed</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {orderDate}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Total Amount */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Amount</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        AED {totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {typeof order.paymentMethod === 'string' ? order.paymentMethod : (order.paymentMethod?.method || 'Cash on Delivery')}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                      <div className="mt-0.5">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Expand Chevron */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadInvoice(order, e)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/60 dark:hover:bg-violet-950/20 transition-all cursor-pointer"
                      title="Download / Print Invoice"
                    >
                      <RiDownload2Line className="w-4 h-4" />
                    </button>
                    <div className="p-2 rounded-xl text-slate-400 bg-slate-100/60 dark:bg-slate-800/60">
                      {isExpanded ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Card Details */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 border-t border-slate-100 dark:border-slate-800/80 pt-6 bg-slate-50/40 dark:bg-slate-950/30">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Ordered Items (7 cols) */}
                      <div className="lg:col-span-7 flex flex-col gap-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                          <RiShoppingBag3Line className="w-4 h-4 text-slate-400" />
                          Items in Order ({totalItemsCount})
                        </h4>

                        <div className="flex flex-col gap-2.5">
                          {items.length === 0 ? (
                            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-400 text-center">
                              No specific item records attached to this order.
                            </div>
                          ) : (
                            items.map((item, idx) => {
                              const itemPrice = Number(item.discountPrice || item.price || 0);
                              const itemQty = Number(item.quantity || 1);
                              return (
                                <div 
                                  key={item.cartItemId || item.id || idx}
                                  className="flex items-center gap-3.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-3 rounded-xl"
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name || 'Product'}
                                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center shrink-0">
                                      <RiShoppingBag3Line className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="flex-grow min-w-0 text-left">
                                    <h5 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                      {item.name || 'Product Item'}
                                    </h5>
                                    <p className="text-[11px] text-slate-450 mt-0.5">
                                      Qty: <span className="font-semibold text-slate-700 dark:text-slate-300">{itemQty}</span>
                                      {item.color && ` • Color: ${item.color}`}
                                      {item.size && item.size !== 'Standard' && ` • Size: ${item.size}`}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200">
                                      AED {(itemPrice * itemQty).toFixed(2)}
                                    </span>
                                    {itemQty > 1 && (
                                      <span className="block text-[10px] text-slate-400">
                                        AED {itemPrice.toFixed(2)} each
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Right: Shipping Address & Summary (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col gap-4 text-left">
                        {/* Delivery Address */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-xl flex flex-col gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <RiMapPinLine className="w-4 h-4 text-violet-500" />
                            Delivery Information
                          </h4>
                          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {customerName}
                            </div>
                            {customerEmail && (
                              <div className="text-slate-500 text-[11px] mt-0.5">
                                ✉️ {customerEmail}
                              </div>
                            )}
                            {customerPhone && (
                              <div className="text-slate-500 text-[11px]">
                                📞 {customerPhone}
                              </div>
                            )}
                            <div className="text-slate-700 dark:text-slate-300 mt-1.5 text-xs">
                              📍 {fullAddress}
                            </div>
                          </div>
                        </div>

                        {/* Payment & Breakdown */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-xl flex flex-col gap-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <RiBankCardLine className="w-4 h-4 text-violet-500" />
                            Payment & Totals
                          </h4>

                          <div className="text-xs font-medium text-slate-650 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-850 dark:text-slate-200">
                              {typeof order.paymentMethod === 'string'
                                ? order.paymentMethod
                                : (order.paymentMethod?.method || 'Cash on Delivery')}
                            </span>
                            <span className="block text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mt-0.5">
                              💵 Pay in AED upon delivery in UAE
                            </span>
                          </div>

                          {/* Pricing breakdown */}
                          <div className="flex flex-col gap-1.5 text-xs">
                            <div className="flex justify-between text-slate-500">
                              <span>Subtotal</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                AED {Number(order.totals?.subtotal ?? totalAmount).toFixed(2)}
                              </span>
                            </div>

                            {Number(order.totals?.discount || 0) > 0 && (
                              <div className="flex justify-between text-emerald-600 font-semibold">
                                <span>Coupon Discount</span>
                                <span>-AED {Number(order.totals.discount).toFixed(2)}</span>
                              </div>
                            )}

                            <div className="flex justify-between text-slate-500">
                              <span>Shipping</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {Number(order.totals?.shipping || 0) === 0 ? 'FREE' : `AED ${Number(order.totals.shipping).toFixed(2)}`}
                              </span>
                            </div>

                            {Number(order.totals?.tax || 0) > 0 && (
                              <div className="flex justify-between text-slate-500">
                                <span>Tax / VAT (5%)</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  AED {Number(order.totals.tax).toFixed(2)}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200/60 dark:border-slate-800 mt-1">
                              <span>Grand Total</span>
                              <span className="text-violet-600 dark:text-violet-400">
                                AED {totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;