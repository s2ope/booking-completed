import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

const Datatable = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [list, setList] = useState([]);
  const { data, loading, error } = useFetch(`/api/${path}`);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      // Ensure data is an array and each item has _id
      const validData = data.filter((item) => item && item._id);
      setList(validData);
    }
  }, [data]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/${path}/${id}`);
      setList(list.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/${path}/${params.row._id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">Edit</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row._id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {path}
        <Link to={`/${path}/new`} className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={list}
        columns={columns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row?._id || `fallback-${Math.random()}`}
        loading={loading}
        error={error}
        components={{
          NoRowsOverlay: () => (
            <div style={{ padding: "1rem", textAlign: "center" }}>
              No data available
            </div>
          ),
        }}
      />
    </div>
  );
};

export default Datatable;
