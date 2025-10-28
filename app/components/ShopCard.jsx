export default function ShopCard({ shop }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h2 className="text-xl font-semibold">{shop.name}</h2>
      <p className="text-gray-600">{shop.location || "No location"}</p>
      <p
        className={`mt-3 inline-block px-3 py-1 text-sm rounded-full ${
          shop.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {shop.status}
      </p>
    </div>
  );
}
