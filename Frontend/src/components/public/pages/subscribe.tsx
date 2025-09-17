import axios from "../../../hooks/api";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Email {
  email: String;
}

const Subscribe = () => {
    const [subscribed, setSubscribed] = useState(false);
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

  useEffect(()=> {
    const savedEmail = localStorage.getItem('SubscribedEmail');
    if (savedEmail) {
        axios.get(`/subscribed/check/?email=${savedEmail}`)
        .then((res)=> {
            if (res.data.subscribed){
                setSubscribed(true);
            }
        }).catch(() => {
            
        })
    }
  }, []);

  const handleSubscribe =async (e: React.FormEvent) => {
    e.preventDefault();
    try{      
      await axios.post<Email>(`/subscribers/`, formData);
      localStorage.setItem('SubscribedEmail',formData.email)
      setSubscribed(true);
      toast.success("Subscribed successfully!");
      setFormData({
        email: '',
      });
    } catch (err){
      toast.error('something went wrong, faild to subscribe!')
    }
  };

  if (subscribed) return (
    <>
        <p className="text-center text-gray-600 py-10">
        ✅ You’re already subscribed to our newsletter.
      </p>
    </>
  )

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-14 px-6 text-center">
      <h2 className="text-3xl font-bold mb-4 mt-6">Subscribe to our Newsletter</h2>
      <p className="text-gray-600 mb-6">
        Stay updated with our latest news, articles, and resources, sent straight
        to your inbox every week.
      </p>

      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto">
        <input
          type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            className="w-full sm:flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Subscribe
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 mb-6">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </section>
  );
};

export default Subscribe;
