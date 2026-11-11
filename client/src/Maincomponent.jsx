import SideHeader from './component/Haeder';
import Mainpage from './component/Mainpage';

export default function Main() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="h-screen shrink-0 z-50">
        <SideHeader />
      </div>

      <div className="flex-1 min-w-0 h-screen">
        <Mainpage />
      </div>
    </div>
  );
}