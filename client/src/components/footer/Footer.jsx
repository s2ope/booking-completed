import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer w-full max-w-[1024px] text-[12px]">
      {/* Footer Lists */}
      <div className="fLists w-full flex justify-between mb-[50px]">
        <div className="fLists w-full flex justify-between mb-[50px]">
          <ul className="fList list-none p-0">
            <li className="fListItem font-bold ">Support</li>
            <li className="fListItem">Coronavirus (COVID-19) FAQs</li>
            <li className="fListItem">Manage your trips</li>
            <li className="fListItem">Contact Customer Service</li>
            <li className="fListItem">Safety resource centre</li>
          </ul>
          <ul className="fList">
            <li className="fListItem font-bold">Genius loyalty programme</li>
            <li className="fListItem">Seasonal and holiday deals</li>
            <li className="fListItem">Travel articles</li>
            <li className="fListItem">Booking.com for Business</li>
            <li className="fListItem">Traveller Review Awards</li>
          </ul>
          <ul className="fList">
            <li className="fListItem font-bold">Car hire</li>
            <li className="fListItem">Flight finder</li>
            <li className="fListItem">Restaurant reservations</li>
            <li className="fListItem">Booking.com for Travel Agents</li>
          </ul>
          <ul className="fList">
            <li className="fListItem font-bold">Terms and settings</li>
            <li className="fListItem">Privacy & cookies</li>
            <li className="fListItem">Terms and conditions</li>
            <li className="fListItem">Partner dispute</li>
            <li className="fListItem">Modern Slavery Statement</li>
            <li className="fListItem">Human Rights Statement</li>
          </ul>
          <ul className="fList">
            <li className="fListItem font-bold">Partners</li>
            <li className="fListItem">Extranet login</li>
            <li className="fListItem">Partner help</li>
            <li className="fListItem">List your property</li>
            <li className="fListItem">Become an affiliate</li>
          </ul>
          <ul className="fList">
            <li className="fListItem font-bold">About</li>
            <li className="fListItem">About Booking.com</li>
            <li className="fListItem">How we work</li>
            <li className="fListItem">Sustainability</li>
            <li className="fListItem">Press centre</li>
            <li className="fListItem">Careers</li>
            <li className="fListItem">Investor relations</li>
            <li className="fListItem">Corporate contact</li>
          </ul>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-gray-300 my-4"></div>

      {/* Copyright and Images Section */}
      <div className="fText text-center">
        <p>Copyright © {currentYear} Mamabooking. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
