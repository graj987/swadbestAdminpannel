import useAdminDashboard from "@/hooks/useAdminDashboard";

const AdminDashboard = () => {
  const { stats, orders, notifications, loading } = useAdminDashboard();

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="p-5 border rounded">
          <h4>Total Orders</h4>
          <p>{stats?.orders}</p>
        </div>

        <div className="p-5 border rounded">
          <h4>Total Revenue</h4>
          <p>₹{stats?.revenue}</p>
        </div>

        <div className="p-5 border rounded">
          <h4>Total Users</h4>
          <p>{stats?.users}</p>
        </div>

        <div className="p-5 border rounded">
          <h4>Products</h4>
          <p>{stats?.products}</p>
        </div>
      </div>

      {/* Latest Orders */}
      <div>
        <h3 className="font-bold mb-3">Latest Orders</h3>

        {orders.map((order) => (
          <div key={order._id} className="border p-3 rounded mb-2">
            <p>Order: {order._id}</p>
            <p>Total: ₹{order.totalAmount}</p>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div>
        <h3 className="font-bold mb-3">Notifications</h3>

        {notifications.map((n) => (
          <div key={n._id} className="border p-3 rounded mb-2">
            {n.message}
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;