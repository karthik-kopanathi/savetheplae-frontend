import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HowItWorks from "./pages/HowItWorks";
import PublicNavbar from "./components/PublicNavbar";
import DonorSettings from "./pages/DonorSettings";
import Donations from "./pages/Donations";
import Notifications from "./pages/Notifications";
import { DonorDashboardLayout, DonorDashboard } from "./pages/DonorDashboard";
import { NgoDashboardLayout, NgoDashboard } from "./pages/NgoDashboard";
import { OrphanageDashboardLayout, OrphanageDashboard } from "./pages/OrphanageDashboard";
import PickupDetails from "./pages/Pickupdetails";
import NgoSettings from "./pages/NgoSettings";
import NgoFoodStock from "./pages/NgoFoodStock";
import NgoPartners from "./pages/NgoPartners";
import NgoNotifications from "./pages/NgoNotifications";
import NgoDonationsReceived from "./pages/NgoDonationsReceived";
import DonorNgoPartners from "./pages/DonorNgoPartners";
import DonorAnalytics   from "./pages/DonorAnalytics";
import OrphanageSettings     from "./pages/OrphanageSettings";
import OrphanageNotifications from "./pages/OrphanageNotifications";
import RequestFood            from "./pages/RequestFood";
import DeliveryDetails from "./pages/DeliveryDetails";
import NgoOrphanages from "./pages/NgoOrphanages";
import NgoAnalytics from "./pages/NgoAnalytics";
import OrphanageAnalytics from "./pages/OrphanageAnalytics";
import OrphanageDonationsReceived from "./pages/OrphanageDonationsReceived";
import PublicOrphanages from "./pages/PublicOrphanages";
function App() {
  return (
    <>
      <PublicNavbar />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/partners" element={<NgoPartners />} />
        <Route path="/orphanages" element={<PublicOrphanages/>}/>
        {/* DONOR DASHBOARD ROUTES (NESTED) */}
        <Route path="/donor-dashboard" element={<DonorDashboardLayout />}>
          <Route index element={<DonorDashboard />} />
          <Route path="donations" element={<Donations />} />
          <Route path="notifications" element={<Notifications />} />
         
          <Route path="partners"   element={<DonorNgoPartners />} />
          <Route path="analytics"  element={<DonorAnalytics />} />
          <Route path="settings" element={<DonorSettings />} />
        </Route>

        {/* NGO DASHBOARD ROUTES (NESTED) */}
        <Route path="/ngo-dashboard" element={<NgoDashboardLayout />}>
          <Route index element={<NgoDashboard />} />
          <Route path="donations-received" element={<NgoDonationsReceived />} />
          <Route path="delivery-details" element={<DeliveryDetails />} />
          <Route path="food-stock" element={<NgoFoodStock />} />
          <Route path="pickup-details" element={<PickupDetails />} />
          <Route path="notifications" element={<NgoNotifications />} />
          <Route path="settings" element={<NgoSettings />} />
          <Route path="analytics"  element={<NgoAnalytics />} />
          <Route path="orphanages" element={<NgoOrphanages />} />
        </Route>
        
          {/* orphanage DASHBOARD ROUTES (NESTED) */}
        <Route path="/orphanage-dashboard" element={<OrphanageDashboardLayout />}>
        <Route index element={<OrphanageDashboard />} />
        <Route path="donations-received" element={<OrphanageDonationsReceived/>} />
       
        <Route path="analytics"  element={<OrphanageAnalytics />} />
        <Route path="settings"      element={<OrphanageSettings />} />
        <Route path="notifications" element={<OrphanageNotifications />} />
        <Route path="request-food"  element={<RequestFood />} />         
      </Route>

      </Routes>
    </>
  );
}

export default App;