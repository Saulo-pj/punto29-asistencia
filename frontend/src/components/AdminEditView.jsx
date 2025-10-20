import React from "react";
import AdminWorkersTable from "./AdminWorkersTable.jsx";

export default function AdminEditView() {
  console.log('AdminEditView: montado');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Gestión de Personal</h1>
      <AdminWorkersTable />
    </div>
  );
}