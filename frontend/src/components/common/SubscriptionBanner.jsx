import React from 'react';
import { AlertTriangle, CreditCard, ShieldAlert } from 'lucide-react';
import { useGetCurrentTenantQuery } from '../../store/api/tenantApi';
import { Link } from 'react-router-dom';

const SubscriptionBanner = () => {
  const { data, isLoading } = useGetCurrentTenantQuery();
  const tenant = data?.data?.tenant;

  if (isLoading || !tenant) return null;

  const isExpired = tenant.status === 'expired' || (tenant.expiryDate && new Date(tenant.expiryDate) < new Date());
  const isTrial = tenant.status === 'trial';

  if (!isExpired && !isTrial) return null;

  return (
    <div className={`w-full px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500 ${
      isExpired ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900 border-b border-amber-200'
    }`}>
      <div className="flex items-center gap-3">
        {isExpired ? <ShieldAlert size={20} /> : <AlertTriangle size={20} className="text-amber-600" />}
        <div className="text-sm">
          <span className="font-bold uppercase tracking-tight mr-2">
            {isExpired ? 'Subscription Expired' : 'Trial Period'}
          </span>
          <span className="font-medium opacity-90">
            {isExpired 
              ? 'Your access is restricted. Please renew your subscription to continue using Welib.' 
              : `Your trial ends soon. Upgrade to a professional plan to avoid service interruption.`
            }
          </span>
        </div>
      </div>
      
      <Link 
        to="/app/settings?tab=billing" 
        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
          isExpired 
            ? 'bg-white text-rose-600 hover:bg-rose-50 shadow-lg' 
            : 'bg-amber-600 text-white hover:bg-amber-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <CreditCard size={14} />
          {isExpired ? 'Renew Now' : 'Upgrade Plan'}
        </div>
      </Link>
    </div>
  );
};

export default SubscriptionBanner;
