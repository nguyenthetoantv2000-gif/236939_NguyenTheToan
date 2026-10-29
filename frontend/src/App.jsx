import { useCallback, useEffect, useState } from "react";
import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from "./api";
import "./App.css";

const emptyForm = {
  foodId: "",
  name: "",
  category: "",
  cuisine: "",
  ingredients: "",
  price: "",
  quantity: "",
  description: "",
  imageUrl: "",
};

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price ?? 0);
}

function extractFood(result) {
  return result?.data?.food ?? result?.data ?? result?.food ?? result;
}

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");

  const loadFoods = useCallback(async (keyword = "") => {
    setLoading(true);
    setError("");

    try {
      const result = await getFoods(keyword);
      setFoods(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách món ăn. Hãy kiểm tra backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId("");
    setError("");
    setModal("form");
  }

  function openEdit(food) {
    setForm({
      foodId: food.foodId ?? "",
      name: food.name ?? "",
      category: food.category ?? "",
      cuisine: food.cuisine ?? "",
      ingredients: Array.isArray(food.ingredients)
        ? food.ingredients.join(", ")
        : "",
      price: String(food.price ?? ""),
      quantity: String(food.quantity ?? ""),
      description: food.description ?? "",
      imageUrl: food.imageUrl ?? "",
    });
    setEditingId(food._id);
    setError("");
    setModal("form");
  }

  async function openDetails(id) {
    setError("");

    try {
      const result = await getFoodById(id);
      setSelectedFood(extractFood(result));
      setModal("detail");
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể tải chi tiết món ăn."
      );
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (
      !form.foodId.trim() ||
      !form.name.trim() ||
      !form.category.trim() ||
      !form.cuisine.trim()
    ) {
      setError("Vui lòng nhập mã món, tên món, loại món và vùng miền.");
      return;
    }

    if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      setError("Giá món ăn phải là số lớn hơn hoặc bằng 0.");
      return;
    }

    if (
      form.quantity.trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Số lượng phải là số nguyên lớn hơn hoặc bằng 0.");
      return;
    }

    const payload = {
      foodId: form.foodId.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      cuisine: form.cuisine.trim(),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      price,
      quantity,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    if (payload.ingredients.length === 0) {
      setError("Vui lòng nhập ít nhất một nguyên liệu.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await updateFood(editingId, payload);
        showNotice("Cập nhật món ăn thành công!");
      } else {
        await createFood(payload);
        showNotice("Thêm món ăn thành công!");
      }

      setModal("");
      setForm(emptyForm);
      setEditingId("");
      await loadFoods(search.trim());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể lưu món ăn. Vui lòng kiểm tra dữ liệu."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(food) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa món "${food.name}" không?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteFood(food._id);
      showNotice("Xóa món ăn thành công!");
      await loadFoods(search.trim());
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể xóa món ăn."
      );
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    await loadFoods(search.trim());
  }

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="brand-icon">🍜</span>
            <span>Food<span className="brand-accent">Manager</span></span>
          </div>

          <p className="eyebrow">HỆ THỐNG QUẢN LÝ MÓN ĂN</p>
          <h1>Quản lý thực đơn</h1>
          <p className="hero-description">
            Quản lý món ăn, nguyên liệu, giá bán và số lượng trong một nơi.
          </p>

          <div className="hero-actions">
            <span className="hero-status">
              <span className="status-dot" /> Quản lý thực đơn
            </span>
            <button className="button button-primary" onClick={openCreate}>
              <span aria-hidden="true">＋</span> Thêm món ăn
            </button>
          </div>
        </div>
      </header>

      <section className="content">
        {notice && (
          <div className="alert alert-success" role="status">
            ✓ {notice}
          </div>
        )}

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
            <button
              className="alert-close"
              onClick={() => setError("")}
              aria-label="Đóng thông báo"
            >
              ×
            </button>
          </div>
        )}

        <div className="section-heading">
          <div>
            <p className="eyebrow">THỰC ĐƠN CỦA BẠN</p>
            <h2>Danh sách món ăn</h2>
            <p className="muted">
              {loading
                ? "Đang tải dữ liệu..."
                : `${foods.length} món ăn được tìm thấy`}
            </p>
          </div>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Tìm theo tên, loại món hoặc vùng miền..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Tìm kiếm món ăn"
          />
          {search && (
            <button
              className="button button-light"
              type="button"
              onClick={() => {
                setSearch("");
                loadFoods("");
              }}
            >
              Xóa
            </button>
          )}
          <button className="button button-dark" type="submit">
            Tìm kiếm
          </button>
        </form>

        {loading ? (
          <div className="state-card">
            <div className="spinner" />
            <p>Đang tải danh sách món ăn...</p>
          </div>
        ) : foods.length === 0 ? (
          <div className="state-card">
            <div className="empty-icon">🍽️</div>
            <h3>Chưa tìm thấy món ăn</h3>
            <p>Thử từ khóa khác hoặc thêm món ăn mới vào thực đơn.</p>
            <button className="button button-primary" onClick={openCreate}>
              Thêm món ăn
            </button>
          </div>
        ) : (
          <div className="food-grid">
            {foods.map((food) => (
              <article className="food-card" key={food._id}>
                <div className="food-image-wrap">
                  {food.imageUrl ? (
                    <img
                      className="food-image"
                      src={food.imageUrl}
                      alt={food.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="food-image-placeholder">🍲</div>
                  )}
                  <span className="category-tag">{food.category}</span>
                </div>

                <div className="food-body">
                  <p className="food-cuisine">{food.cuisine}</p>
                  <h3>{food.name}</h3>
                  <p className="food-description">
                    {food.description || "Chưa có mô tả cho món ăn này."}
                  </p>

                  <div className="food-meta">
                    <div>
                      <span className="meta-label">Giá bán</span>
                      <strong className="food-price">
                        {formatPrice(food.price)}
                      </strong>
                    </div>
                    <div className="quantity">
                      <span className="meta-label">Số lượng</span>
                      <strong>{food.quantity ?? 0}</strong>
                    </div>
                  </div>

                  <div className="food-actions">
                    <button
                      className="button button-light"
                      onClick={() => openDetails(food._id)}
                    >
                      Chi tiết
                    </button>
                    <button
                      className="button button-light"
                      onClick={() => openEdit(food)}
                    >
                      Sửa
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => handleDelete(food)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modal === "form" && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setModal("");
              setError("");
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">
                  {editingId ? "CẬP NHẬT THÔNG TIN" : "THÊM VÀO THỰC ĐƠN"}
                </p>
                <h2 id="form-title">
                  {editingId ? "Sửa món ăn" : "Thêm món ăn mới"}
                </h2>
              </div>
              <button
                className="modal-close"
                onClick={() => {
                  setModal("");
                  setError("");
                }}
                disabled={submitting}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <form className="food-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Mã món ăn *
                  <input
                    name="foodId"
                    value={form.foodId}
                    onChange={handleChange}
                    placeholder="VD: FOOD004"
                    required
                    disabled={Boolean(editingId)}
                  />
                </label>
                <label>
                  Tên món ăn *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nhập tên món"
                    required
                  />
                </label>
                <label>
                  Loại món ăn *
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="VD: Món nước"
                    required
                  />
                </label>
                <label>
                  Vùng miền *
                  <input
                    name="cuisine"
                    value={form.cuisine}
                    onChange={handleChange}
                    placeholder="VD: Miền Bắc"
                    required
                  />
                </label>
                <label>
                  Giá bán (VNĐ) *
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Số lượng *
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label>
                Nguyên liệu * (phân cách bằng dấu phẩy)
                <input
                  name="ingredients"
                  value={form.ingredients}
                  onChange={handleChange}
                  placeholder="Bánh phở, Thịt bò, Hành"
                  required
                />
              </label>

              <label>
                Đường dẫn hình ảnh
                <input
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>

              <label>
                Mô tả
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Mô tả món ăn..."
                />
              </label>

              <div className="form-footer">
                <button
                  type="button"
                  className="button button-light"
                  onClick={() => {
                    setModal("");
                    setError("");
                  }}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Đang lưu..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Thêm món ăn"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal === "detail" && selectedFood && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal("");
          }}
        >
          <section
            className="modal detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">CHI TIẾT MÓN ĂN</p>
                <h2 id="detail-title">{selectedFood.name}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setModal("")}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {selectedFood.imageUrl && (
              <img
                className="detail-image"
                src={selectedFood.imageUrl}
                alt={selectedFood.name}
              />
            )}

            <div className="detail-grid">
              <div><span>Mã món</span><strong>{selectedFood.foodId}</strong></div>
              <div><span>Loại món</span><strong>{selectedFood.category}</strong></div>
              <div><span>Vùng miền</span><strong>{selectedFood.cuisine}</strong></div>
              <div><span>Giá bán</span><strong>{formatPrice(selectedFood.price)}</strong></div>
              <div><span>Số lượng</span><strong>{selectedFood.quantity}</strong></div>
              <div>
                <span>Nguyên liệu</span>
                <strong>
                  {Array.isArray(selectedFood.ingredients)
                    ? selectedFood.ingredients.join(", ")
                    : "Chưa có"}
                </strong>
              </div>
            </div>

            <div className="detail-description">
              <span>Mô tả</span>
              <p>{selectedFood.description || "Chưa có mô tả."}</p>
            </div>

            <div className="form-footer">
              <button
                className="button button-light"
                onClick={() => setModal("")}
              >
                Đóng
              </button>
              <button
                className="button button-primary"
                onClick={() => openEdit(selectedFood)}
              >
                Sửa món ăn
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="footer">
        <span>FoodManager</span>
        <span>Hệ thống quản lý món ăn · React + Express + MongoDB</span>
      </footer>
    </main>
  );
}

export default App;