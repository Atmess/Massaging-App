import ChatList from './component/Chatlist';
import SideHeader from './component/Haeder';
import Mainpage from './component/Mainpage';

export default function Main() {
  return (
    <div className="flex min-h-screen relative">
      {/* 1. SideHeader wrapper with high z-index to stay on top */}
      <div className="sticky top-0 h-screen shrink-0 z-50">
        <SideHeader />
      </div>

      {/* 2. Chat List Sidebar */}
      <div className="sticky top-0 h-screen w-110 bg-white border-r border-stone-200 shrink-0 z-10">
        <ChatList />
      </div>

      {/* 3. Main Page Content */}
      <div className="flex-1 h-screen overflow-y-auto">
        <Mainpage />
      </div>
    </div>
  );
}