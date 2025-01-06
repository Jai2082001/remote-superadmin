'use client'

import { useEffect, useState } from 'react';
import Header from '../../components/Header';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/get-restaurants');
        const data = await response.json();
        
        if (response.ok) {
          setRestaurants(data.restaurants);
        } else {
          setError(data.error || 'Error fetching restaurants');
        }
      } catch (error) {
        setError('Failed to fetch restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) return <p className="text-center text-lg text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <Header />
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Restaurants List</h1>
      {restaurants.length === 0 ? (
        <p className="text-center text-lg text-gray-500">No restaurants found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{restaurant.name}</h2>
              <p className="text-sm text-gray-600 mb-2">Email: {restaurant.email}</p>
              {/* You can add more restaurant details here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
