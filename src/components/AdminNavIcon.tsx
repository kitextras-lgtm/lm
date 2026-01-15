import {
  AdminApplicationsIconSVG,
  AdminAlertsIconSVG,
  AdminMessagesIconSVG,
  AdminUsersIconSVG,
  AdminDataIconSVG,
  AdminNotificationsIconSVG,
} from './AdminIcons';

interface AdminNavIconProps {
  itemId: string;
  isActive?: boolean;
}

export function AdminNavIcon({ itemId, isActive = false }: AdminNavIconProps) {
  const getIcon = () => {
    switch (itemId) {
      case 'applications':
        return <AdminApplicationsIconSVG />;
      case 'alerts':
        return <AdminAlertsIconSVG />;
      case 'messages':
        return <AdminMessagesIconSVG />;
      case 'users':
        return <AdminUsersIconSVG />;
      case 'data':
        return <AdminDataIconSVG />;
      case 'notifications':
        return <AdminNotificationsIconSVG />;
      default:
        return null;
    }
  };

  return (
    <div className={`messages-icon group ${isActive ? 'active' : ''}`}>
      <div className="messages-icon-wrapper">
        {getIcon()}
      </div>
    </div>
  );
}
