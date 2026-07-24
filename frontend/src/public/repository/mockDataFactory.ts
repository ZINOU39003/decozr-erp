import { Category, Product, Project, Review, Service, FAQ } from '../schemas/public.types';

// Constants
const CATEGORY_NAMES = [
  'أثاث مكتبي', 'غرف نوم', 'مطابخ', 'غرف معيشة', 'إضاءة', 
  'ديكورات حائط', 'أثاث خارجي', 'سجاد', 'مرايا', 'أرفف ووحدات تخزين',
  'أثاث ذكي', 'أثاث أطفال', 'ستائر', 'طاولات طعام', 'كراسي',
  'أرائك', 'أثاث تجاري', 'تجهيزات فنادق', 'تجهيزات مطاعم', 'أبواب',
  'نوافذ', 'أرضيات خشبية', 'أثاث كلاسيكي', 'أثاث نيو كلاسيك', 'أثاث مودرن',
  'أثاث فندقي', 'ديكورات حدائق', 'أعمال خشبية', 'نجارة مخصصة', 'وحدات تلفاز',
  'مكاتب منزلية', 'كراسي جيمنج', 'أطقم جلوس', 'طاولات وسط', 'طاولات جانبية',
  'أثاث معدني', 'ديكورات معدنية', 'قواطع جدارية', 'لوحات فنية', 'إكسسوارات منزلية',
  'تحف', 'ساعات حائط', 'ورق جدران', 'ديكورات جبسية', 'أطقم ضيافة',
  'كراسي استرخاء', 'أثاث طبي', 'خزائن ملابس', 'تجهيزات معارض', 'ديكورات أسقف'
];

const COLORS = [
  { name: 'أبيض', hex: '#FFFFFF' },
  { name: 'أسود', hex: '#000000' },
  { name: 'رمادي', hex: '#808080' },
  { name: 'بني', hex: '#8B4513' },
  { name: 'بيج', hex: '#F5F5DC' },
  { name: 'أزرق', hex: '#0000FF' },
  { name: 'أخضر', hex: '#008000' },
  { name: 'ذهبي', hex: '#FFD700' },
  { name: 'فضي', hex: '#C0C0C0' }
];

const MATERIALS = ['خشب زان', 'خشب سويدي', 'MDF', 'زجاج', 'معدن', 'قماش مخمل', 'جلد طبيعي', 'ستانلس ستيل'];

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505691938895-1758d7bef511?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'
];

const PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600607688969-a5bfcd64bdde?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200',
];

// Helper functions
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomItem = <T>(array: T[]): T => array[getRandomInt(0, array.length - 1)];

// Generators
export const generateCategories = (): Category[] => {
  return CATEGORY_NAMES.map((name, index) => ({
    id: `cat-${index + 1}`,
    name,
    slug: name.replace(/\s+/g, '-'),
    description: `تسوق أفضل منتجات ${name} بجودة عالية وتصاميم عصرية.`,
    image: getRandomItem(PRODUCT_IMAGES),
    productCount: getRandomInt(10, 50)
  }));
};

export const generateProducts = (categories: Category[]): Product[] => {
  const products: Product[] = [];
  for (let i = 1; i <= 300; i++) {
    const category = getRandomItem(categories);
    const price = getRandomInt(500, 15000);
    const hasDiscount = Math.random() > 0.7;
    
    products.push({
      id: `prod-${i}`,
      name: `منتج ${category.name} ${i}`,
      slug: `product-${i}`,
      categoryId: category.id,
      categoryName: category.name,
      price: hasDiscount ? Math.floor(price * 0.8) : price,
      originalPrice: hasDiscount ? price : undefined,
      description: `هذا المنتج من أفضل منتجات ${category.name}، مصمم بعناية ليناسب ذوقك الرفيع ويضفي لمسة من الفخامة على مساحتك.`,
      images: getRandomItems(PRODUCT_IMAGES, getRandomInt(1, 4)),
      materials: getRandomItems(MATERIALS, getRandomInt(1, 3)),
      colors: getRandomItems(COLORS, getRandomInt(1, 4)),
      dimensions: `${getRandomInt(50, 200)}x${getRandomInt(50, 200)}x${getRandomInt(50, 200)} سم`,
      inStock: Math.random() > 0.1,
      rating: Number((Math.random() * (5 - 3) + 3).toFixed(1)),
      reviewsCount: getRandomInt(0, 150),
      features: ['ضمان 5 سنوات', 'توصيل مجاني', 'تركيب مجاني', 'صديق للبيئة'],
      isNew: Math.random() > 0.8,
      isFeatured: Math.random() > 0.8,
    });
  }
  return products;
};

export const generateProjects = (): Project[] => {
  const projects: Project[] = [];
  const projectTypes = ['فيلا سكنية', 'مقر شركة', 'فندق', 'مطعم', 'مقهى', 'معرض تجاري'];
  
  for (let i = 1; i <= 150; i++) {
    const type = getRandomItem(projectTypes);
    projects.push({
      id: `proj-${i}`,
      title: `تأثيث وتجهيز ${type} - مشروع ${i}`,
      slug: `project-${i}`,
      category: type,
      description: `مشروع متكامل لتجهيز وتأثيث ${type} بأحدث المعايير العصرية. تم الانتهاء من المشروع في وقت قياسي مع الالتزام بأعلى معايير الجودة.`,
      client: `شركة العميل ${i} للتجارة`,
      location: getRandomItem(['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'الخبر']),
      completionDate: `202${getRandomInt(3, 6)}-0${getRandomInt(1, 9)}-15`,
      images: getRandomItems(PROJECT_IMAGES, getRandomInt(2, 4)),
      features: ['تصميم 3D', 'تصنيع مخصص', 'توريد وتركيب', 'إشراف هندسي'],
      isFeatured: Math.random() > 0.9,
    });
  }
  return projects;
};

// Lazy initialization of mock database
let db: {
  categories: Category[];
  products: Product[];
  projects: Project[];
} | null = null;

export const getMockDb = () => {
  if (!db) {
    const categories = generateCategories();
    const products = generateProducts(categories);
    const projects = generateProjects();
    db = { categories, products, projects };
  }
  return db;
};
