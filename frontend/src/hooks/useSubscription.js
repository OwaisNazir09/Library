import { useGetCurrentTenantQuery } from '../store/api/tenantApi';

export const useSubscription = () => {
  const { data, isLoading } = useGetCurrentTenantQuery();
  const tenant = data?.data?.tenant;

  const isExpired = tenant?.status === 'expired' || (tenant?.expiryDate && new Date(tenant.expiryDate) < new Date());
  
  const hasFeature = (featureName) => {
    if (isExpired) return false;
    return tenant?.features?.[featureName] ?? true;
  };

  const getLimit = (limitName) => {
    return tenant?.limits?.[limitName] ?? Infinity;
  };

  return {
    tenant,
    isLoading,
    isExpired,
    hasFeature,
    getLimit
  };
};
