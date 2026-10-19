import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ShopLayout from './components/layout/ShopLayout';
import SellerLayout from './components/layout/SellerLayout';
import RequireAuth from './components/RequireAuth';
import RouteError from './pages/RouteError';

// Each page is its own chunk, so the first visit only downloads what it needs.
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Compare = lazy(() => import('./pages/Compare'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/info/About'));
const Faq = lazy(() => import('./pages/info/Faq'));
const Support = lazy(() => import('./pages/info/Support'));
const PrivacyPolicy = lazy(() => import('./pages/info/PrivacyPolicy'));
const ReturnPolicy = lazy(() => import('./pages/info/ReturnPolicy'));
const Sell = lazy(() => import('./pages/seller/Sell'));
const SellerLogin = lazy(() => import('./pages/seller/SellerLogin'));
const SellerSignup = lazy(() => import('./pages/seller/SellerSignup'));
const Dashboard = lazy(() => import('./pages/seller/Dashboard'));
const Products = lazy(() => import('./pages/seller/Products'));
const ProductCreate = lazy(() => import('./pages/seller/ProductCreate'));
const ProductManage = lazy(() => import('./pages/seller/ProductManage'));
const Shipments = lazy(() => import('./pages/seller/Shipments'));
const Finance = lazy(() => import('./pages/seller/Finance'));
const Profile = lazy(() => import('./pages/seller/Profile'));

const customer = (element) => <RequireAuth role="customer">{element}</RequireAuth>;

// Paths match the original app so existing links (and emailed reset links) keep working.
const routes = [
  {
    element: <ShopLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/shop', element: <Shop /> },
      { path: '/men', element: <Shop key="M" gender="M" /> },
      { path: '/women', element: <Shop key="F" gender="F" /> },
      { path: '/unisex', element: <Shop key="U" gender="U" /> },
      { path: '/buyer_products/:id', element: <ProductPage /> },
      { path: '/compare', element: <Compare /> },
      { path: '/checkout', element: customer(<Checkout />) },
      { path: '/orders', element: customer(<Orders />) },
      { path: '/orders/:id', element: customer(<OrderDetail />) },
      { path: '/order-confirmation', element: <Navigate to="/orders" replace /> },
      { path: '/settings', element: customer(<Settings />) },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/ForgotPassword', element: <ForgotPassword /> },
      { path: '/ChangePassword/:token', element: <ResetPassword /> },
      { path: '/SellerForgotPassword', element: <ForgotPassword seller /> },
      { path: '/SellerChangePassword/:token', element: <ResetPassword seller /> },
      { path: '/about', element: <About /> },
      { path: '/faq', element: <Faq /> },
      { path: '/support', element: <Support /> },
      { path: '/privacyPolicy', element: <PrivacyPolicy /> },
      { path: '/returnPolicy', element: <ReturnPolicy /> },
      { path: '/sell', element: <Sell /> },
      { path: '/loginSeller', element: <SellerLogin /> },
      { path: '/signupSeller', element: <SellerSignup /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: (
      <RequireAuth role="seller">
        <SellerLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { path: '/sellerDashboard', element: <Dashboard /> },
      { path: '/productlist', element: <Products /> },
      { path: '/product/create', element: <ProductCreate /> },
      { path: '/products/:id', element: <ProductManage /> },
      { path: '/shipment', element: <Shipments /> },
      { path: '/finance', element: <Finance /> },
      { path: '/sellerProfile', element: <Profile /> },
    ],
  },
];

export default routes;
