import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Clipboard,
  Package,
  Wallet,
  Settings,
  ChevronLeft,
} from 'lucide-react';

export default function Sidebar({ isOpen }) {
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      title: 'Orçamentos',
      icon: <FileText className="h-5 w-5" />,
      path: '/dashboard/orcamentos',
    },
    {
      title: 'Finanças',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/dashboard/financas',
    },
    {
      title: 'Ordem de Serviços',
      icon: <Clipboard className="h-5 w-5" />,
      path: '/dashboard/ordens',
    },
    {
      title: 'Estoque',
      icon: <Package className="h-5 w-5" />,
      path: '/dashboard/estoque',
    },
    {
      title: 'Caixa',
      icon: <Wallet className="h-5 w-5" />,
      path: '/dashboard/caixa',
    },
    {
      title: 'Configurações',
      icon: <Settings className="h-5 w-5" />,
      path: '/dashboard/configuracoes',
    },
  ];

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-20',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {isOpen ? (
            <h2 className="text-xl font-bold text-blue-600">Vidraçaria</h2>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-xl font-bold text-blue-600">V</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 group"
                >
                  <div className="mr-3">{item.icon}</div>
                  {isOpen && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Vidraçaria Sistema</p>
                <p className="text-xs text-gray-500">v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

