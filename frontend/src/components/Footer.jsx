import React, { useState } from "react";
import OpenCenterFormModal from "./OpenCenterFormModal";
import { useAuthStore } from "../stores/authStore";

export default function Footer() {
  const [isOpenCenterModalOpen, setIsOpenCenterModalOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <>
      <footer className="bg-slate-800 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="text-2xl font-extrabold text-green-500 mb-3">SPORTIFY</div>
            <p className="text-sm text-gray-400 max-w-md">
              The world's largest sports community to book venues, join games, and find players near you.
            </p>
            <p className="text-xs text-gray-500 mt-4">� 2026 Techsam Solutions Pvt Ltd. All rights reserved.</p>
          </div>

          {!user && (<div className="flex items-center justify-center">
            <h4 className="text-white font-semibold mb-4 flex flex-col items-center text-center gap-3">
              <span>Open Your Sports Center Here</span>
              <button
                type="button"
                onClick={() => setIsOpenCenterModalOpen(true)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition"
              >
                List Your Venue
              </button>
            </h4>
          </div>)}

          <div>
            <h4 className="text-white font-semibold mb-4">Social</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-green-400 cursor-pointer transition">Instagram</li>
              <li className="hover:text-green-400 cursor-pointer transition">Facebook</li>
              <li className="hover:text-green-400 cursor-pointer transition">LinkedIn</li>
              <li className="hover:text-green-400 cursor-pointer transition">Twitter</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-green-400 cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-green-400 cursor-pointer transition">Terms of Service</li>
              <li className="hover:text-green-400 cursor-pointer transition">Cancellation Policy</li>
              <li className="hover:text-green-400 cursor-pointer transition">FAQs</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <span>Made with ❤️ for sports lovers</span>
            <span>India | UAE | Sri Lanka | Australia</span>
          </div>
        </div>
      </footer>

      <OpenCenterFormModal
        isOpen={isOpenCenterModalOpen}
        onClose={() => setIsOpenCenterModalOpen(false)}
      />
    </>
  );
}
