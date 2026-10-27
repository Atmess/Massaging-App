import Header from './component/Haeder';
import Mainpage from './component/Mainpage';

export default function Main() {
  return (
    <div className="flex min-h-screen">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <Mainpage />
      </div>
    </div>
  );
}
