import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "sonner";
import Index from "@/pages/Index";
import Cars from "@/pages/Cars";
import Auth from "@/pages/Auth";
import ProviderAuth from "@/pages/ProviderAuth";
import ProviderDashboard from "@/pages/ProviderDashboard";

function App() {
  return (
    <Router>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/provider/auth" element={<ProviderAuth />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        </Routes>
        <Toaster />
        <SonnerToaster />
      </TooltipProvider>
    </Router>
  );
}

export default App;