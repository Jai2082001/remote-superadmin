'use client'

import { useState } from 'react';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurantData({ ...restaurantData, [name]: value });
  };
  console.log(restaurantData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      });
      
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        // router.push('/restaurants'); // Redirect to restaurant list page
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Error creating restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header></Header>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Create New Restaurant</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
              <input
                type="text"
                name="name"
                value={restaurantData.name}
                onChange={handleChange}
                className="w-full text-black mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={restaurantData.email}
                onChange={handleChange}
                className="w-full text-black mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="number"
                name="phone"
                value={restaurantData.phone}
                onChange={handleChange}
                className="w-full text-black mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Restaurant'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
