
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getFoods = async (search = "") => {
  const response = await api.get("/foods", {
    params: search ? { search } : {},
  });
  return response.data;
};

export const getFoodById = async (id) => {
  const response = await api.get(`/foods/${id}`);
  return response.data;
};

export const createFood = async (food) => {
  const response = await api.post("/foods", food);
  return response.data;
};

export const updateFood = async (id, food) => {
  const response = await api.put(`/foods/${id}`, food);
  return response.data;
};

export const deleteFood = async (id) => {
  const response = await api.delete(`/foods/${id}`);
  return response.data;
};
