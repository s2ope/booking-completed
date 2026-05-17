import { Link } from "react-router-dom";
import { Bookmark, CalendarCheck, Hotel, Search } from "lucide-react";

const footerSections = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Search hotels", to: "/hotels" },
      { label: "Berlin stays", to: "/destinations/Berlin" },
      { label: "Madrid stays", to: "/destinations/Madrid" },
      { label: "London stays", to: "/destinations/London" },
    ],
  },
  {
    title: "Property Types",
    links: [
      { label: "Hotels", to: "/property-types/hotel" },
      { label: "Apartments", to: "/property-types/apartment" },
      { label: "Resorts", to: "/property-types/resort" },
      { label: "Villas", to: "/property-types/villa" },
      { label: "Cabins", to: "/property-types/cabin" },
    ],
  },
  {
    title: "Your Trips",
    links: [
      { label: "My bookings", to: "/my-bookings" },
      { label: "Saved properties", to: "/saved" },
      { label: "My account", to: "/my-account" },
      { label: "Login", to: "/login" },
      { label: "Register", to: "/register" },
    ],
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 w-full bg-[#003580] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Link to="/" className="text-2xl font-black tracking-normal">
              Mamabooking
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-blue-100">
              Find stays, save favorites, and keep your bookings organized in
              one place.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/hotels"
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#003580] hover:bg-blue-50"
              >
                <Search className="h-4 w-4" />
                Search stays
              </Link>
              <Link
                to="/saved"
                className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-white hover:bg-[#214F9F]"
              >
                <Bookmark className="h-4 w-4" />
                View saved
              </Link>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                  {section.title}
                </h2>
                <nav className="mt-3 flex flex-col gap-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-sm text-blue-100 hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-blue-300/30 pt-5 text-sm text-blue-100 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Curated stays for every trip
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Manage bookings quickly
          </div>
          <div className="sm:text-right">
            Copyright © {currentYear} Mamabooking. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
