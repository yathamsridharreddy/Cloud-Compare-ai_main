import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children, context = 'ai' }) {
  return (
    <div className="min-h-screen bg-dark-900 flex text-white">
      <Sidebar context={context} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
