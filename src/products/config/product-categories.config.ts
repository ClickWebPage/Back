/**
 * Configuración de categorías de productos basadas en palabras clave
 * 
 * Cada categoría tiene:
 * - name: Nombre de la categoría
 * - keywords: Array de palabras clave para clasificar productos (case-insensitive)
 * - priority: Orden de evaluación (menor = mayor prioridad)
 */

export interface ProductCategory {
  name: string;
  keywords: string[];
  priority: number;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    name: 'Laptops',
    keywords: ['laptop', 'notebook', 'ultrabook', 'chromebook'],
    priority: 1,
  },
  {
    name: 'Tintas y Toners',
    keywords: ['tinta', 'toner', 'cartucho', 'ribbon'],
    priority: 2,
  },
  {
    name: 'Impresoras',
    keywords: ['impresora', 'printer', 'multifuncional', 'escaner'],
    priority: 3,
  },
  {
    name: 'Monitores',
    keywords: ['monitor', 'pantalla', 'display'],
    priority: 4,
  },
  {
    name: 'Accesorios',
    keywords: ['mouse', 'teclado', 'keyboard', 'audifono', 'auricular', 'camara', 'webcam'],
    priority: 5,
  },
  {
    name: 'Almacenamiento',
    keywords: ['disco duro', 'hdd', 'ssd', 'memoria usb', 'pendrive', 'microsd'],
    priority: 6,
  },
  {
    name: 'Componentes',
    keywords: ['procesador', 'memoria ram', 'tarjeta', 'motherboard', 'fuente', 'cooler'],
    priority: 7,
  },
  {
    name: 'Redes',
    keywords: ['router', 'switch', 'cable', 'antena', 'modem', 'wifi'],
    priority: 8,
  },
  {
    name: 'Software',
    keywords: ['office', 'windows', 'antivirus', 'licencia'],
    priority: 9,
  },
  {
    name: 'Otros',
    keywords: [], // Categoría por defecto para productos no clasificados
    priority: 99,
  },
];

/**
 * Determina la categoría de un producto basándose en su nombre
 * @param productName Nombre del producto
 * @returns Nombre de la categoría asignada
 */
export function determineProductCategory(productName: string | null): string {
  if (!productName) return 'Otros';

  const normalizedName = productName.toLowerCase();

  // Buscar la primera categoría que coincida (ordenadas por prioridad)
  const sortedCategories = PRODUCT_CATEGORIES
    .filter(cat => cat.keywords.length > 0) // Excluir "Otros" inicialmente
    .sort((a, b) => a.priority - b.priority);

  for (const category of sortedCategories) {
    for (const keyword of category.keywords) {
      if (normalizedName.includes(keyword.toLowerCase())) {
        return category.name;
      }
    }
  }

  // Si no se encuentra ninguna categoría, devolver "Otros"
  return 'Otros';
}

/**
 * Valida si una categoría existe en la configuración
 * @param categoryName Nombre de la categoría a validar
 * @returns true si la categoría existe
 */
export function isValidCategory(categoryName: string): boolean {
  return PRODUCT_CATEGORIES.some(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
}

/**
 * Obtiene todas las categorías disponibles
 * @returns Array con los nombres de todas las categorías
 */
export function getAllCategoryNames(): string[] {
  return PRODUCT_CATEGORIES.map(cat => cat.name);
}
