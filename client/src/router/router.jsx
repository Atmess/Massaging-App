import ErrorPage from '../ErrorPage';
import Main from '../Maincomponent';
import Home from '../component/Homepage';
import Shop from '../component/Shoppage';
import Cart from '../component/Cartpage';
import Single from '../component/Single';
import StructureDeck from '../component/Strukturedeck';
import SealedProduct from '../component/SealedProduck';
import Accessories from '../component/Accessories';
import MyDeck from '../component/MyDeck';
import Login from '../UserAcces/Login';
import Register from '../UserAcces/Register';
import Dashboard from '../dashboard/Dashboard';
import ProfilePage from '../UserAcces/UserProfile';
import MiddleboardLayout from '../component/Middleboard';
import SinglePostView from '../posts/Singlepost';
import PublishedPostsPage from '../posts/PublishPostList';
import MessagePage from '../Message/MessagePage';

const routes = [
  {
    path: '/',
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <MiddleboardLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'posts', element: <PublishedPostsPage /> },
          { path: 'posts/:id', element: <SinglePostView /> },
          { path: 'UserProfile', element: <ProfilePage /> },
        ],
      },
      {
        path: 'shop',
        element: <Shop />,
        children: [
          { path: '/shop', element: <Single /> },
          { path: '/shop/struckture', element: <StructureDeck /> },
          { path: '/shop/sealed', element: <SealedProduct /> },
          { path: '/shop/accessories', element: <Accessories /> },
          { path: '/shop/mydeck', element: <MyDeck /> },
        ],
      },
      { path: 'cart', element: <Cart /> },
      { path: 'login', element: <Login /> },
      { path:'register',element:<Register/> },
      { path: 'message', element: <MessagePage /> },
    ],
  },
];

export default routes;
