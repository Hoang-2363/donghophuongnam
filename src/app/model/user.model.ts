export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  imgUrl: string;
  address: string;
  password?: string;
  role: string;
  createAt: number;
  updateAt?: number;
  isActive: boolean;
  tokenExpiryTime: number;
  token: string;
  file?: File; // Thêm để lưu file khi upload
  fileName?: string; // Lưu tên file
  imagePreview?: string; // Lưu preview ảnh
}
