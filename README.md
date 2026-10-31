# Management Employee Frontend

Ứng dụng Angular quản lý nhân sự, gồm màn hình tự phục vụ cho nhân viên và các màn hình quản trị. Giao diện sử dụng Angular 19, TypeScript, Ng Zorro, RxJS cùng hai thư viện dùng chung `@platform/shared` và `@platform/ui-kit`.

## Chức năng

Nhân viên có thể xem dashboard, hồ sơ, chấm công, công việc, nghỉ phép, phiếu lương và thông báo. Quản trị viên có thể quản lý nhân viên, cơ cấu tổ chức, chức vụ, ca làm và lịch ca, ngày nghỉ, chấm công, công việc, nghỉ phép, thông báo, lương, tài khoản, vai trò, quyền, menu và nhật ký thao tác.

## Yêu cầu

- Node.js và npm tương thích với Angular 19.
- Các dự án nằm cạnh nhau như sau để các đường dẫn thư viện tương đối hoạt động:

```text
DoAn/
├── managementEmployeeFe/
└── mfe-platform-libs-no-keycloak/
```

## Cài đặt và chạy

Build các thư viện dùng chung trước, sau đó cài và chạy frontend:

```bash
cd ../mfe-platform-libs-no-keycloak
npm ci
npm run build

cd ../managementEmployeeFe
npm ci
npm start
```

Mở `http://localhost:4200/login` để đăng nhập. Các route nghiệp vụ yêu cầu phiên đăng nhập hợp lệ.

## Kết nối backend

Mặc định, `src/environments/environment.ts` đặt API base URL là `http://localhost:8088`; đây là địa chỉ API Gateway mà frontend dùng để gọi các backend. Gateway cần định tuyến các context path `/employee-service/**`, `/attendance-service/**`, `/payroll-service/**`, `/leave-service/**` và `/notification-service/**` đến service tương ứng.

Luồng xác thực dùng API nội bộ:

- `POST /employee-service/api/auth/login` nhận `username` và `password`, trả access token.
- `GET /employee-service/api/auth/me` lấy thông tin tài khoản đang đăng nhập.
- `authInterceptor` tự thêm Bearer token vào các request được gửi đến backend.

Khi đổi địa chỉ API, cập nhật `apiBaseUrl` trong `src/environments/environment.ts` và `src/environments/environment.prod.ts`. Backend Employee Service mặc định chạy trực tiếp ở `http://localhost:8080/employee-service`; Attendance Service mặc định ở `http://localhost:8081/attendance-service`.

## Nhánh chứa mã nguồn

| Thành phần | Repository | Nhánh |
| --- | --- | --- |
| Frontend quản lý nhân sự | [`managementEmployeeFe`](https://github.com/Nguyendat0819/managementEmployeeFe/tree/develop) | `develop` |
| Thư viện Angular dùng chung | [`mfe-platform-libs-no-keycloak`](https://github.com/Nguyendat0819/mfe-platform-libs-no-keycloak/tree/develop) | `develop` |
| API Gateway | [`managementEmployee`](https://github.com/Nguyendat0819/managementEmployee/tree/api-gateway) | `api-gateway` |
| Employee Service | [`managementEmployee`](https://github.com/Nguyendat0819/managementEmployee/tree/employee-service) | `employee-service` |
| Attendance Service | [`managementEmployee`](https://github.com/Nguyendat0819/managementEmployee/tree/attendance-service) | `attendance-service` |
| Payroll Service | [`managementEmployee`](https://github.com/Nguyendat0819/managementEmployee/tree/payroll-service) | `payroll-service` |
| Leave Service | [`managementEmployee`](https://github.com/Nguyendat0819/managementEmployee/tree/leave-service) | `leave-service` |
| Notification Service | [`managementEmployee`](https://github.com/Nguyendat0819/managementEmployee/tree/notification-service) | `notification-service` |

Các nhánh trên là nơi lưu mã nguồn theo từng phần của hệ thống. Working copy frontend hiện ở nhánh `develop`.

## Build

```bash
npm run build
```

Ứng dụng cũng phụ thuộc vào output build trong `../mfe-platform-libs-no-keycloak/dist/platform/`. Nếu build frontend lỗi do thiếu `@platform/shared` hoặc `@platform/ui-kit`, chạy lại `npm run build` trong dự án thư viện dùng chung.
