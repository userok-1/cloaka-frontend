import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Icon className="w-12 h-12 text-zinc-600 mb-4" />
      <h3 className="text-lg font-medium text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 text-center mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}
