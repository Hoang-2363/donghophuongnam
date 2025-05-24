export interface Brand {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  country: string;
  createAt: number;
  updateAt: number | null;
  file?: File; // Thêm để lưu file khi upload
  fileName?: string; // Lưu tên file
  imagePreview?: string; // Lưu preview ảnh
}