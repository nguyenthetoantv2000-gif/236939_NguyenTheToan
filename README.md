Hệ thống quản lý món ăn trên nền tảng đám mây

1. Thông tin sinh viên

Họ và tên: Nguyễn Thế Toàn

Mã số sinh viên: 236939

Học phần: Điện toán đám mây

Đề tài: Xây dựng và triển khai hệ thống quản lý món ăn trên nền tảng đám mây

2. Mục tiêu

Xây dựng ứng dụng quản lý món ăn gồm giao diện người dùng, backend API và cơ sở dữ liệu MongoDB Atlas. Mã nguồn được quản lý bằng GitHub, ứng dụng được đóng gói bằng Docker, lưu trữ trên Docker Hub và triển khai trên Render.

3. Công nghệ sử dụng

Frontend: React, JavaScript

Backend: Node.js, Express

Cơ sở dữ liệu: MongoDB Atlas

Quản lý mã nguồn: Git, GitHub

Đóng gói ứng dụng: Docker, Docker Hub

Triển khai: Render

4. Cấu trúc dự án

236939_NguyenTheToan/
├── frontend/
│   └── src/
├── backend/
├── README.md
└── .gitignore

5. Chức năng dự kiến

Hiển thị danh sách món ăn.

Xem chi tiết món ăn.

Thêm món ăn mới.

Cập nhật thông tin món ăn.

Xóa món ăn.

Tìm kiếm món ăn theo tên, loại món hoặc vùng miền.

6. Hướng dẫn cài đặt và chạy chương trình

Yêu cầu môi trường

Node.js và npm

Git

MongoDB Atlas

Docker Desktop (khi thực hiện đóng gói ứng dụng)

Chạy backend

Di chuyển vào thư mục backend:

cd backend
npm install

Tạo file .env trong thư mục backend và cấu hình các biến môi trường:

PORT=5000
MONGODB_URI=<MongoDB_Atlas_Connection_String>
CLIENT_URL=http://localhost:5173

Khởi chạy backend:

npm run dev

Chạy frontend

Mở terminal mới:

cd frontend
npm install

Tạo file .env trong thư mục frontend:

VITE_API_URL=http://localhost:5000

Khởi chạy frontend:

npm run dev

Các lệnh cài đặt và chạy trên sẽ được sử dụng sau khi hoàn thành cấu hình frontend và backend ở các câu tiếp theo.

7. Triển khai trên nền tảng đám mây

GitHub Repository: sẽ cập nhật sau.

Docker Hub Backend: sẽ cập nhật sau.

Docker Hub Frontend: sẽ cập nhật sau.

Render Frontend: sẽ cập nhật sau.

Render Backend API: sẽ cập nhật sau.

8. Bảo mật

Không đưa file .env, mật khẩu, access token hoặc chuỗi kết nối MongoDB chứa thông tin xác thực lên GitHub. Các thông tin cấu hình bí mật được quản lý bằng biến môi trường.
cap nhat 
[https://web-236939.onrender.com](https://web-236939.onrender.com)   