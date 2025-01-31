import React from "react";

const NotFoundPage = () => (
  <section className="bg-white py-12 text-center">
    <div className="max-w-xl mx-auto">
      <h1 className="text-6xl font-bold text-blue-900 mb-5">404</h1>
      <p className="text-2xl font-bold text-blue-900 mb-2">
        Something's missing.
      </p>
      <p className="text-lg text-gray-600 mb-5">
        Sorry, we can't find that page. You'll find lots to explore on the home
        page.
      </p>
      <a
        href="/"
        className="inline-block bg-blue-900 text-white px-5 py-2 rounded-md text-base hover:bg-blue-600"
      >
        Back to Homepage
      </a>
    </div>
  </section>
);

export default NotFoundPage;
