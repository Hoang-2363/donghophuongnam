export interface FilterType {
  brandsType: string[];
  categoriesType: string[];
  prices: string[];
  genders: string[];
  straps: string[];
  movementTypes: string[];
  caseSizes: string[];
  thicknesses: string[];
  glassMaterials: string[];
  caseMaterials: string[];
  waterResistanceLevels: string[];
}

export const STRAP_TYPES: string[] = [
  'Da cao cấp',
  'Dây da',
  'Thép không gỉ',
  'Dây kim loại',
  'Silicone',
  'Cao su',
  'Vải NATO',
  'Nhựa PU',
  'Dây lưới Milanese',
  'Titan',
];

export const MOVEMENT_TYPES: string[] = [
  'Automatic - 38.5mm',
  'Quartz - 40mm',
  'Mechanical - 42mm',
  'Solar - 39mm',
  'Automatic Chronograph - 44mm',
  'Quartz Chronograph - 41mm',
  'Kinetic - 43mm',
  'Manual Wind - 36mm',
  'Smartwatch - 45mm',
  'Hybrid - 40.5mm',
];

export const GENDERS: string[] = ['Nam', 'Nữ'];
export const PRICE_RANGES: string[] = [
  'Dưới 1 triệu',
  'Từ 1 - 5 triệu',
  'Từ 5 - 10 triệu',
  'Từ 10 - 20 triệu',
  'Trên 20 triệu',
];

export const CASE_SIZES: string[] = [
  'Dưới 30mm',
  '30mm - 34mm',
  '35mm - 38mm',
  '39mm - 41mm',
  '42mm - 45mm',
  'Trên 45mm',
];

export const THICKNESS_RANGES: string[] = [
  'Dưới 6mm',
  '6mm - 8mm',
  '9mm - 11mm',
  '12mm - 14mm',
  'Trên 14mm',
];

export const GLASS_MATERIALS: string[] = [
  'Kính Sapphire',
  'Kính cứng (Mineral)',
  'Kính Mica (Acrylic)',
  'Kính Hardlex',
  'Kính Gorilla Glass',
  'Kính Plexiglass',
  'Kính Sapphire phủ AR',
];

export const CASE_MATERIALS: string[] = [
  'Thép không gỉ',
  'Titan (Titanium)',
  'Nhựa Resin',
  'Gốm Ceramic',
  'Vàng 18K',
  'Thép mạ PVD',
  'Carbon Fiber',
  'Hợp kim nhôm (Aluminum)',
  'Đồng (Bronze)',
  'Vỏ phủ DLC',
];

export const WATER_RESISTANCE_LEVELS: string[] = [
  'Không chống nước',
  '3 ATM / 30m – Chịu nước nhẹ',
  '5 ATM / 50m – Đi mưa, tắm',
  '10 ATM / 100m – Bơi lội',
  '20 ATM / 200m – Lặn nông',
  'Diver 200m – Lặn chuyên nghiệp',
  '300m trở lên – Lặn sâu',
];
