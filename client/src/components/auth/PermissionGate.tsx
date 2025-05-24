import { ReactNode } from 'react';
import { Permission, usePermission } from '../../hooks/usePermission';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders content based on user permissions
 */
const PermissionGate = ({ permission, children, fallback = null }: PermissionGateProps) => {
  const { hasPermission } = usePermission();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default PermissionGate;