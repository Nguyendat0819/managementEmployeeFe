# Management Employee Frontend

Angular 19 frontend cho quản lý nhân viên, sử dụng `@platform/shared` và `@platform/ui-kit` từ `../mfe-platform-libs-no-keycloak`.

Xác thực dùng backend nội bộ:

- `POST /employee-service/api/auth/login` nhận `username` và `password`.
- `GET /employee-service/api/auth/me` trả người dùng hiện tại.
- `authInterceptor` tự gắn Bearer token cho request tới API backend.

Khởi chạy local:

```bash
npm install
npm start
```

Màn hình đăng nhập ở `/login`; route nghiệp vụ yêu cầu token hợp lệ.
