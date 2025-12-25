import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ icon: Icon = FiInbox, title, description, action }) => {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-16 w-16 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
