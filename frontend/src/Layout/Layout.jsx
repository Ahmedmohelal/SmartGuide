import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";

const Layout = () => {
  return (
   <>
    <Toaster  />
    <div className="flex flex-col min-h-screen">  
      <Navbar />
        <Outlet />
      <Footer />
    </div>
    </>
  );
};

export default Layout;