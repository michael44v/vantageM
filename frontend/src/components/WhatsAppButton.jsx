import { MessageCircle } from "lucide-react";
//import { adminService } from "../services/api";


export default function WhatsAppButton() {
  const phoneNumber = "+447728467790"; // Replace with real support number
  const message = "Hello, I need assistance with my vāntãgeCFD account.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-20 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group"
      aria-label="Contact Support on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-sm">
        Support
      </span>
    </a>
  );
}
