
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
 <div className="imageContainer flex justify-center space-x-4 mt-4">
        <div className="imageItem text-center">
          <img
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=48&h=48&fit=crop&crop=center"
            alt="Priceline"
            className="mx-auto w-12 h-12 object-cover rounded bg-white p-1"
          />
        </div>
        <div className="imageItem text-center">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=48&h=48&fit=crop&crop=center"
            alt="Kayak"
            className="mx-auto w-12 h-12 object-cover rounded bg-white p-1"
          />
        </div>
        <div className="imageItem text-center">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=48&h=48&fit=crop&crop=center"
            alt="Agoda"
            className="mx-auto w-12 h-12 object-cover rounded bg-white p-1"
          />
        </div>
        <div className="imageItem text-center">
          <img
            src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=48&h=48&fit=crop&crop=center"
            alt="Rentalcars"
            className="mx-auto w-12 h-12 object-cover rounded bg-white p-1"
          />
        </div>
        <div className="imageItem text-center">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=48&h=48&fit=crop&crop=center"
            alt="OpenTable"
            className="mx-auto w-12 h-12 object-cover rounded bg-white p-1"
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;

