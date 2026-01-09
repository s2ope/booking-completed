import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer w-full max-w-[1024px] text-[12px]">
      {/* Copyright and Images Section */}
      <div className="fText text-center">
        <p>Copyright © {currentYear} Mamabooking. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
