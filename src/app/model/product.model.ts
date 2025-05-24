import { Brand } from './brand.model';
import { Category } from './category.model';

export interface Product {
  id?: number;
  productCode?: string;
  name: string;
  description: string;
  stockQuantity: number;
  priceImport: number;
  priceSelling: number;
  strapType: string;
  movementType: string;
  caseSize: string;
  thickness: string;
  glassMaterial: string;
  caseMaterial: string;
  waterResistance: string;
  warranty: string;
  brandId: number;
  categoryIds: number[];
  imageUrls: string[];
  createAt?: number;
  updateAt?: number;

  brand?: Brand;
  categories?: Category[];
}
