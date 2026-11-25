import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Order, Payment, User } from '../../types';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { 
  ChevronLeft, ChevronRight, User as UserIcon, Package, CreditCard, 
  Save, AlertCircle, CheckCircle2 
} from 'lucide-react';

type Tab = 'profile' | 'orders' | 'payments';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Quản lý tài khoản
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Xem và cập nhật thông tin cá nhân, lịch sử đơn hàng và thanh toán
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <nav className="bg-slate-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl space-y-1.5">
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`w-full flex items-center gap-3 font-semibold p-3 rounded-xl transition-all duration-200 group ${
                activeTab === 'profile' 
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-slate-800 text-slate-400 group-hover:text-neon-cyan'}`}>
                <UserIcon size={18} />
              </div>
              <span>Hồ sơ cá nhân</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`w-full flex items-center gap-3 font-semibold p-3 rounded-xl transition-all duration-200 group ${
                activeTab === 'orders' 
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-slate-800 text-slate-400 group-hover:text-neon-cyan'}`}>
                <Package size={18} />
              </div>
              <span>Đơn hàng của tôi</span>
            </button>
            <button 
              onClick={() => setActiveTab('payments')} 
              className={`w-full flex items-center gap-3 font-semibold p-3 rounded-xl transition-all duration-200 group ${
                activeTab === 'payments' 
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'payments' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-slate-800 text-slate-400 group-hover:text-neon-cyan'}`}>
                <CreditCard size={18} />
              </div>
              <span>Lịch sử thanh toán</span>
            </button>
          </nav>
        </div>
        <div className="md:w-3/4 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800">
          {activeTab === 'profile' && <ProfileDetails />}
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'payments' && <PaymentHistory />}
        </div>
      </div>
    </div>
  );
};

// Profile Details Component
const ProfileDetails: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  // Initialize form with existing context data immediately to avoid loading flash
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    address: user?.address || '' 
  });
  
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Fetch fresh data in background (stale-while-revalidate)
  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const res = await api.get<any>('/profile');
            // Handle flexible response structure
            const userData = res.data || res.user || res;
            
            if (userData) {
                 setFormData(prev => ({
                     name: userData.name !== undefined ? userData.name : prev.name,
                     phone: userData.phone !== undefined ? userData.phone : prev.phone,
                     address: userData.address !== undefined ? userData.address : prev.address
                 }));
                 
                 // Silently update global user context if we got fresh data
                 if (user && userData.id) {
                     updateUser({ ...user, ...userData });
                 }
            }
        } catch (error) {
            console.error("Background profile sync failed, using cached data", error);
        }
    };
    fetchProfile();
  }, []); // Run once on mount
  
  const commonInputClass = "mt-1.5 block w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const payload: any = { ...formData };
      if (password) payload.password = password;
      
      const response = await api.put<{user: User} | User>('/profile', payload);
      const updatedData = (response as any).user || response || {};
      
      // Update local context immediately
      if (user) {
          const newUserState = { ...user, ...updatedData, ...formData };
          updateUser(newUserState);
      }

      setMessage({type: 'success', text: 'Cập nhật thông tin thành công!'});
      setPassword(''); 
    } catch(err: any) {
        setMessage({type: 'error', text: err.message || 'Cập nhật thông tin thất bại.'});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white flex items-center gap-2.5">
        <UserIcon className="text-neon-cyan" size={24} />
        <span>Hồ sơ cá nhân</span>
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300">Họ và tên</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className={commonInputClass}
            placeholder="Nhập họ và tên..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Email (Không thể thay đổi)</label>
          <input 
            type="email" 
            value={user?.email || ''} 
            readOnly 
            disabled 
            className={`${commonInputClass} bg-slate-950/60 border-slate-800/80 text-slate-500 cursor-not-allowed`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Số điện thoại</label>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
            className={commonInputClass}
            placeholder="Nhập số điện thoại..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Địa chỉ giao hàng</label>
          <textarea 
            rows={3} 
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})} 
            className={commonInputClass}
            placeholder="Nhập địa chỉ nhận hàng..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Mật khẩu mới (để trống nếu không muốn đổi)</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className={commonInputClass} 
            placeholder="••••••••"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm flex items-center gap-2.5 border ${
            message.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isLoading} 
            className="flex items-center gap-2 px-6 py-2.5 bg-neon-cyan text-dark-base font-bold rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Save size={16} />
            <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Pagination helper for profile tabs
const ProfilePagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-3 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-neon-cyan hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-700/70"
        title="Trang trước"
      >
        <ChevronLeft size={18} />
      </button>
      
      <span className="text-slate-400 text-sm font-medium px-2">
        Trang <span className="text-white font-semibold">{currentPage}</span> / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-neon-cyan hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-700/70"
        title="Trang sau"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

// Order History Component
const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: Order[] } | Order[]>('/order');
            const orderList = Array.isArray(res) ? res : (res?.data || []);
            setOrders(orderList);
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const confirmCancelOrder = async () => {
        if (cancelingOrderId === null) return;
        try {
            await api.patch(`/order/${cancelingOrderId}/cancel`, {});
            fetchOrders();
        } catch (err: any) {
            alert(err.message || 'Hủy đơn hàng thất bại.');
        }
    };

    const handleCancelOrder = (orderId: number) => {
        setCancelingOrderId(orderId);
    };

    // Pagination Logic
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const currentOrders = orders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    if(loading) return <div className="flex justify-center p-12"><Spinner /></div>;
    if(error) return <p className="text-rose-400 p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">{error}</p>;

    return (
        <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white flex items-center gap-2.5">
              <Package className="text-neon-cyan" size={24} />
              <span>Đơn hàng của tôi</span>
            </h2>
            {orders.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800">
                    <Package className="mx-auto text-slate-600 mb-3" size={40} />
                    <p className="text-slate-400 text-sm">Bạn chưa có đơn hàng nào.</p>
                </div>
            ) : (
                <>
                  <div className="space-y-4">
                      {currentOrders.map(order => (
                          <div key={order.id} className="border border-slate-800 bg-slate-950/60 p-4 sm:p-5 rounded-2xl hover:border-slate-700 transition-all">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                  <div>
                                      <div className="flex items-center gap-2.5 mb-1.5">
                                          <p className="font-bold text-base sm:text-lg text-white">Đơn hàng #{order.id}</p>
                                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                                              order.status === 'Confirmed' || order.status === 'Shipped' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                                              order.status === 'Cancelled' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                                              'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                          }`}>
                                              {order.status}
                                          </span>
                                      </div>
                                      <p className="text-xs text-slate-400">Ngày đặt: {new Date(order.order_date).toLocaleDateString('vi-VN')}</p>
                                  </div>
                                  <div className="text-left sm:text-right mt-1 sm:mt-0">
                                      <p className="font-extrabold text-base sm:text-lg text-neon-cyan">{parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</p>
                                      {order.status === 'Pending' && (
                                          <button onClick={() => handleCancelOrder(order.id)} className="text-xs text-rose-400 hover:text-rose-300 hover:underline mt-1 font-medium transition-colors">
                                            Hủy đơn hàng
                                          </button>
                                      )}
                                  </div>
                              </div>
                              <div className="border-t border-slate-800/80 mt-3 pt-3">
                                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Danh sách linh kiện</p>
                                  <div className="space-y-1.5">
                                      {order.OrderDetails.map(detail => (
                                          <div key={detail.id} className="text-sm flex justify-between text-slate-300">
                                              <span>{detail.Product.name} <span className="text-slate-500 text-xs">x{detail.quantity}</span></span>
                                              <span className="font-medium text-slate-200">{(detail.quantity * parseFloat(detail.price)).toLocaleString('vi-VN')} ₫</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <ProfilePagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                  />
                </>
            )}

            <ConfirmModal
              isOpen={cancelingOrderId !== null}
              onClose={() => setCancelingOrderId(null)}
              onConfirm={confirmCancelOrder}
              title="Hủy đơn hàng"
              message="Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi xác nhận, đơn hàng sẽ được hủy."
              confirmText="Xác nhận hủy"
            />
        </div>
    );
}

// Payment History Component
const PaymentHistory: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: Payment[] }>('/payment/me/all');
            setPayments(res.data || []);
        } catch (err: any) {
            setError(err.message || 'Không thể tải lịch sử thanh toán.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Pagination Logic
    const totalPages = Math.ceil(payments.length / itemsPerPage);
    const currentPayments = payments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    if(loading) return <div className="flex justify-center p-12"><Spinner /></div>;
    if(error) return <p className="text-rose-400 p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">{error}</p>;

    return (
        <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white flex items-center gap-2.5">
              <CreditCard className="text-neon-cyan" size={24} />
              <span>Lịch sử thanh toán</span>
            </h2>
            {payments.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800">
                    <CreditCard className="mx-auto text-slate-600 mb-3" size={40} />
                    <p className="text-slate-400 text-sm">Bạn chưa có giao dịch thanh toán nào.</p>
                </div>
            ) : (
                <>
                  <div className="space-y-4">
                      {currentPayments.map(payment => (
                          <div key={payment.id} className="border border-slate-800 bg-slate-950/60 p-4 sm:p-5 rounded-2xl hover:border-slate-700 transition-all">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div>
                                      <div className="flex items-center gap-2.5 mb-1.5">
                                          <p className="font-bold text-base sm:text-lg text-white">Giao dịch #{payment.id}</p>
                                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                                            payment.status === 'Success' 
                                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                                              : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                          }`}>
                                              {payment.status}
                                          </span>
                                      </div>
                                      <div className="text-xs text-slate-400 space-y-0.5">
                                          <p>Đơn hàng #{payment.order_id} • Phương thức: <span className="text-slate-300 font-medium">{payment.method}</span></p>
                                          <p>Thời gian: {new Date(payment.payment_date).toLocaleString('vi-VN')}</p>
                                      </div>
                                  </div>
                                  <div className="text-left sm:text-right mt-1 sm:mt-0">
                                      <p className="font-extrabold text-base sm:text-lg text-neon-cyan">
                                          {parseFloat(payment.amount).toLocaleString('vi-VN')} ₫
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <ProfilePagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                  />
                </>
            )}
        </div>
    );
}

export default ProfilePage;