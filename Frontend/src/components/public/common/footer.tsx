import axios from "../../../hooks/api";
import React, { useState } from "react";
import type { FormEvent } from "react";  // type-only import for FormEvent
import type { IconType } from "react-icons"; // type-only import for IconType
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa"; // actual values
import { toast } from "react-toastify";

const socialIcons: { icon: IconType; link: string }[] = [
  { icon: FaFacebookF, link: "https://facebook.com" },
  { icon: FaTwitter, link: "https://twitter.com" },
  { icon: FaInstagram, link: "https://instagram.com" },
];

interface Email {
  email: String;
}

const Footer: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "email"
        ? (value)
        : value,
    }));
  };

  const handleSubscribe =async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await axios.post<Email>(`/subscribers/`, formData);
      toast.success("Subscribed successfully!");
      setFormData({
        email: '',
      });
    } catch (err){
      toast.error('something went wrong, faild to subscribe!')
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-6 lg:px-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">PlayRent</h3>
          <p className="text-gray-400">
            Your go-to platform for booking playgrounds and sports fields.
            Safe, convenient, and affordable rentals for your next game or
            event.
          </p>
          <div className="flex mt-4 space-x-4">
            {socialIcons.map(({ icon: Icon, link }, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-500 transition"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-green-500 transition">
                Home
              </a>
            </li>
            <li>
              <a href="/services" className="hover:text-green-500 transition">
                Services
              </a>
            </li>
            <li>
              <a href="/booking" className="hover:text-green-500 transition">
                Booking
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-green-500 transition">
                About Us
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Subscribe</h3>
          <p className="text-gray-400 mb-4">
            Get updates about new fields and special offers.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} PlayRent. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
