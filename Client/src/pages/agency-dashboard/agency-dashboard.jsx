import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { defaultAvatarUrl } from '../../assets/default-avatar';

const AgencyDashboard = () => {
  const [agency, setAgency] = useState(null);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        const agencyId = localStorage.getItem('selectedAgencyId');
        const token = localStorage.getItem('token');

        if (!agencyId) {
          toast.error('No agency selected');
          navigate('/agency');
          return;
        }

        const response = await fetch(`http://localhost:5000/agency/${agencyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAgency(data);
          
          // Fetch enrolled users
          const usersResponse = await fetch(`http://localhost:5000/agency/${agencyId}/users`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setEnrolledUsers(usersData);
          } else {
            toast.error('Failed to load enrolled users');
          }
        } else {
          toast.error('Failed to load agency data');
          navigate('/agency');
        }
      } catch (error) {
        console.error('Error fetching agency data:', error);
        toast.error('Failed to load agency data');
        navigate('/agency');
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyData();
  }, [navigate]);

  const handleUserAction = (userId) => {
    // Implement user action logic here
    console.log('User action clicked:', userId);
  };

  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return defaultAvatarUrl;
    // Ensure the URL is absolute and points to the backend
    if (profileImage.startsWith('http')) return profileImage;
    return `http://localhost:5000/profileImages/${profileImage}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#eb2168]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Agency Info Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#eb2168]">{agency?.name}</h1>
          <button 
            onClick={() => navigate('/agency')}
            className="px-4 py-2 bg-[#eb2168] text-white rounded-lg hover:bg-[#d41a5a] transition-colors"
          >
            Back to Agencies
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Agency Details</h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">Email:</span> {agency?.email}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">Phone:</span> {agency?.phone}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">Destination:</span> {agency?.destination}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">Description:</span> {agency?.description}
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-[#eb2168]">{enrolledUsers.length}</p>
                  <p className="text-gray-600">Total Enrolled Users</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-[#eb2168]">
                    {enrolledUsers.filter(user => user.isActive).length}
                  </p>
                  <p className="text-gray-600">Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Users Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Enrolled Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrolledUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover"
                          src={getProfileImageUrl(user.profileImage)}
                          alt={user.name || 'User avatar'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatarUrl;
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleUserAction(user._id)}
                      className="text-[#eb2168] hover:text-[#d41a5a]"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
