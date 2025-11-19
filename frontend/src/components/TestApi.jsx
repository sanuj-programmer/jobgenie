import React from "react";
import API from "../api/apiClient";

export default function TestApi() {
  const test = async () => {
    try {
      const res = await API.get("/");
      console.log("API SUCCESS:", res.data);
    } catch (err) {
      console.error("API ERROR:", err);
    }
  };

  return (
    <button onClick={test} style={{ padding: 10, marginBottom: 20 }}>
      Test API
    </button>
  );
}
