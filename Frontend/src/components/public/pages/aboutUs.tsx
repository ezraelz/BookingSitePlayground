import React from "react";
import { Link } from "react-router-dom";

const AboutUs: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-6 lg:px-20">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-6 -top-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10" />
      <div className="pointer-events-none absolute -bottom-8 -right-10 h-48 w-48 translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-500/10" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl md:text-5xl font-bold text-gray-800">
            About <span className="text-green-600">PlayRent</span>
          </h2>
          <div className="mx-auto mb-6 h-1 w-24 bg-green-500" />
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
            Welcome to <span className="font-semibold text-green-600">PlayRent</span>,
            your go-to platform for booking high-quality sports fields and playgrounds.
            Whether you’re planning a casual match, a training session, or a full
            tournament, we make it easy to find and reserve the perfect space.
          </p>
        </div>

        {/* Hero: text + image */}
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Text block */}
          <div className="order-2 md:order-1">
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
              <h3 className="text-2xl font-semibold text-gray-800">
                Our Mission
              </h3>
              <p className="mt-3 text-gray-600">
                We connect players, teams, and communities with quality facilities.
                From football to basketball to tennis, we focus on availability,
                transparent pricing, and a delightful booking experience.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-green-50 p-4">
                  <div className="text-2xl font-bold text-green-700">4.9/5</div>
                  <div className="text-xs text-green-800/80">User Rating</div>
                </div>
                <div className="rounded-xl bg-indigo-50 p-4">
                  <div className="text-2xl font-bold text-indigo-700">1200+</div>
                  <div className="text-xs text-indigo-800/80">Reviews</div>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <div className="text-2xl font-bold text-green-700">300+</div>
                  <div className="text-xs text-green-800/80">Venues</div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/booking"
                  className="inline-flex items-center rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-green-700 hover:shadow-lg"
                >
                  Book a Playground Now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Image block – place your image in public/images/about-hero.jpg */}
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl" />
              <img
                src="/images/about-hero.jpg"
                alt="Players enjoying a match on a premium field"
                className="relative h-[320px] w-full rounded-3xl object-cover shadow-xl ring-1 ring-black/5 md:h-[420px]"
              />
            </div>
            <p className="mt-3 text-center text-sm text-gray-500">
              Tip: put your image at <code>/public/images/about-hero.jpg</code>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg transition hover:-translate-y-1.5 hover:shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-4 text-center text-xl font-semibold text-gray-800">
              Easy Booking
            </h3>
            <p className="flex-grow text-center text-gray-600">
              Find available playgrounds near you and reserve your preferred time slot in just a few clicks.
            </p>
          </div>

          <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg transition hover:-translate-y-1.5 hover:shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-4 text-center text-xl font-semibold text-gray-800">
              Affordable Prices
            </h3>
            <p className="flex-grow text-center text-gray-600">
              We work with local field owners to bring you the best rates without hidden costs.
            </p>
          </div>

          <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg transition hover:-translate-y-1.5 hover:shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="mb-4 text-center text-xl font-semibold text-gray-800">
              Quality Fields
            </h3>
            <p className="flex-grow text-center text-gray-600">
              Our listed playgrounds are well-maintained to ensure a safe and enjoyable experience for everyone.
            </p>
          </div>
        </div>

        {/* Reviews row (kept from your original, slightly refined) */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Join thousands of satisfied customers who have booked with us
          </p>
          <div className="mt-3 flex items-center justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-gray-600">4.9/5 from 1200+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
