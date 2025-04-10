import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AgencySignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    phone: "",
    destination: "",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the current user's token
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        toast.error("Please login first");
        navigate("/signup");
        return;
      }

      const response = await fetch("http://localhost:5000/agency/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          ...formData,
          userId: localStorage.getItem("userId") // Add the current user's ID
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Store agency token separately from user token
        localStorage.setItem("agencyToken", result.agencyToken);
        localStorage.setItem("agencyId", result.agencyId);
        toast.success("Agency registered successfully!");
        navigate("/agency");
      } else {
        const error = await response.json();
        toast.error(error.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An error occurred during registration");
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <section className="bg-gray-50 bg-cover">
        <div className="flex flex-col items-center justify-center mx-auto md:h-screen lg:py-0">
          <a
            className="flex items-center mb-6 text-2xl font-bold text-[#eb2168] pt-8"
          >
            TravelSphere
          </a>
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Agency Sign Up
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Agency Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-gray-50 border border-#E02168 text-gray-900 sm:text-sm rounded-lg focus:ring-[#E02168] focus:border-[#E02168] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#E02168] dark:focus:border-[#E02168]"
                    placeholder="Enter agency name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-50 border border-#E02168 text-gray-900 sm:text-sm rounded-lg focus:ring-[#E02168] focus:border-[#E02168] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#E02168] dark:focus:border-[#E02168]"
                    placeholder="Enter agency email"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-gray-50 border border-#E02168 text-gray-900 sm:text-sm rounded-lg focus:ring-[#E02168] focus:border-[#E02168] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#E02168] dark:focus:border-[#E02168]"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-#E02168 text-gray-900 sm:text-sm rounded-lg focus:ring-[#E02168] focus:border-[#E02168] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#E02168] dark:focus:border-[#E02168]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="destination"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Destination
                  </label>
                  <input
                    type="text"
                    name="destination"
                    id="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="bg-gray-50 border border-#E02168 text-gray-900 sm:text-sm rounded-lg focus:ring-[#E02168] focus:border-[#E02168] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#E02168] dark:focus:border-[#E02168]"
                    placeholder="Enter main destination"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="bg-gray-50 border border-#E02168 text-gray-900 sm:text-sm rounded-lg focus:ring-[#E02168] focus:border-[#E02168] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#E02168] dark:focus:border-[#E02168]"
                    placeholder="Enter agency description"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-[#eb2168] hover:bg-[#E02168] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Sign Up
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <a
                    href="/agency/login"
                    className="font-medium text-[#eb2168] hover:underline dark:text-primary-500"
                  >
                    Login here
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgencySignup; 