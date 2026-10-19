import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '../dist/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/** Price helper: apply discount percent, rounded to the nearest Toman. */
const finalPrice = (price: number, discountPercent = 0) =>
  Math.round(price * (1 - discountPercent / 100));

async function main() {
  console.log('🌱 Seeding automotive marketplace (Tapsi Garage style)...');

  // 1. Users (kept from the original store seed)
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      password: adminPassword,
      name: 'مدیر فروشگاه',
      role: Role.ADMIN,
      cart: { create: {} },
    },
  });

  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@store.com' },
    update: {},
    create: {
      email: 'customer@store.com',
      password: customerPassword,
      name: 'مشتری نمونه',
      role: Role.CUSTOMER,
      cart: { create: {} },
    },
  });
  console.log('✓ Users seeded (admin@store.com / admin123)');

  // 2. Cities — 15 active cities with Persian names and URL slugs
  const citiesData = [
    { slug: 'tehran', name: 'تهران', sortOrder: 1 },
    { slug: 'karaj', name: 'کرج', sortOrder: 2 },
    { slug: 'qom', name: 'قم', sortOrder: 3 },
    { slug: 'isfahan', name: 'اصفهان', sortOrder: 4 },
    { slug: 'tabriz', name: 'تبریز', sortOrder: 5 },
    { slug: 'mashhad', name: 'مشهد', sortOrder: 6 },
    { slug: 'ahvaz', name: 'اهواز', sortOrder: 7 },
    { slug: 'shiraz', name: 'شیراز', sortOrder: 8 },
    { slug: 'rasht', name: 'رشت', sortOrder: 9 },
    { slug: 'neyshabur', name: 'نیشابور', sortOrder: 10 },
    { slug: 'mazandaran', name: 'مازندران', sortOrder: 11 },
    { slug: 'urmia', name: 'ارومیه', sortOrder: 12 },
    { slug: 'kerman', name: 'کرمان', sortOrder: 13 },
    { slug: 'qazvin', name: 'قزوین', sortOrder: 14 },
    { slug: 'kermanshah', name: 'کرمانشاه', sortOrder: 15 },
  ] as const;

  const cities: Record<string, { id: number }> = {};
  for (const city of citiesData) {
    const row = await prisma.city.upsert({
      where: { slug: city.slug },
      update: { name: city.name, sortOrder: city.sortOrder, active: true },
      create: city,
    });
    cities[city.slug] = row;
  }
  console.log('✓ 15 cities seeded');

  // 3. Categories — the six main marketplace sections
  const categoriesData = [
    { slug: 'wheels-tires', name: 'رینگ و لاستیک', icon: 'LifeBuoy', description: 'لاستیک و رینگ انواع خودروهای ایرانی' },
    { slug: 'oils-lubricants', name: 'روغن و روان کار', icon: 'Droplets', description: 'روغن موتور، گیربکس و ضدیخ' },
    { slug: 'car-electrical', name: 'برق خودرو', icon: 'Zap', description: 'باتری، دینام و استارت' },
    { slug: 'spare-parts', name: 'لوازم یدکی', icon: 'Cog', description: 'قطعات یدکی مصرفی و فلزی' },
    { slug: 'car-care', name: 'نظافت خودرو', icon: 'Sparkles', description: 'شامپو، واکس و لوازم شست‌وشو' },
    { slug: 'motorcycle', name: 'موتورسیکلت', icon: 'Bike', description: 'قطعات و تجهیزات موتورسیکلت' },
  ] as const;

  const categories: Record<string, { id: number }> = {};
  for (const category of categoriesData) {
    const row = await prisma.category.upsert({
      where: { name: category.name },
      update: { slug: category.slug, icon: category.icon },
      create: category,
    });
    categories[category.slug] = row;
  }
  console.log('✓ 6 marketplace categories seeded');

  // 4. Products — Toman pricing.
  //    The 6 exact oil & filter bundles from the spec (SERVICE_KIT with the
  //    "تعویض" badge) + supporting parts for the category listings.
  interface SeedProduct {
    name: string;
    slug: string;
    brand?: string;
    description?: string;
    price: number;
    discountPercent?: number;
    stock: number;
    serviceType?: 'PRODUCT' | 'SERVICE_KIT';
    compatibleVehicles?: string[];
    categorySlug: string;
  }

  const products: SeedProduct[] = [
    // --- The 6 oil & filter bundles from the spec ---
    {
      name: 'پک روغن پژو 405 بهتام کوانتیک (SL 20W50) 4L + فیلتر',
      slug: 'oil-pack-peugeot405-behtam-quantum-sl-20w50',
      brand: 'بهتام',
      description: 'روغن موتور بهتام کوانتیک SL 20W50 (۴ لیتر) + فیلتر روغن اصل. مناسب پژو ۴۰۵، پارس و ۴۰۵ GLX.',
      price: 3_600_000, discountPercent: 8, stock: 40,
      serviceType: 'SERVICE_KIT',
      compatibleVehicles: ['پژو 405', 'پارس', '405'],
      categorySlug: 'oils-lubricants',
    },
    {
      name: 'پک روغن پراید بهتام کوانتیک (SL 20W50) 4L + فیلتر',
      slug: 'oil-pack-pride-behtam-quantum-sl-20w50',
      brand: 'بهتام',
      description: 'روغن موتور بهتام کوانتیک SL 20W50 (۴ لیتر) + فیلتر روغن. مناسب پراید، تیبا و ری‌را.',
      price: 3_400_000, discountPercent: 8, stock: 55,
      serviceType: 'SERVICE_KIT',
      compatibleVehicles: ['پراید', 'تیبا', 'ری‌را'],
      categorySlug: 'oils-lubricants',
    },
    {
      name: 'پک روغن تیبا ساینا کوییک بهتام کوانتیک (SL 10W40) 4L + فیلتر',
      slug: 'oil-pack-tiba-saina-quick-behtam-sl-10w40',
      brand: 'بهتام',
      description: 'روغن موتور بهتام کوانتیک SL 10W40 (۴ لیتر) + فیلتر روغن. مناسب تیبا، ساینا و کوییک.',
      price: 4_300_000, discountPercent: 6, stock: 30,
      serviceType: 'SERVICE_KIT',
      compatibleVehicles: ['تیبا', 'ساینا', 'کوییک'],
      categorySlug: 'oils-lubricants',
    },
    {
      name: 'پک روغن پژو 206 تیپ 2 بهتام کوانتیک (SL 20W50) + فیلتر',
      slug: 'oil-pack-peugeot206-typ2-behtam-quantum-sl-20w50',
      brand: 'بهتام',
      description: 'روغن موتور بهتام کوانتیک SL 20W50 + فیلتر روغن اصل. مناسب پژو ۲۰۶ تیپ ۲ و ۳.',
      price: 3_500_000, discountPercent: 9, stock: 35,
      serviceType: 'SERVICE_KIT',
      compatibleVehicles: ['پژو 206', '206 تیپ 2'],
      categorySlug: 'oils-lubricants',
    },
    {
      name: 'پک روغن خودروهای TU5 بهتام کوانتیک (SL 10W40) 4L + فیلتر',
      slug: 'oil-pack-tu5-behtam-quantum-sl-10w40',
      brand: 'بهتام',
      description: 'روغن موتور بهتام کوانتیک SL 10W40 (۴ لیتر) + فیلتر روغن. مناسب موتورهای TU5 (۲۰۶ تیپ ۵، ۲۰۷، رانا پلاس).',
      price: 4_400_000, discountPercent: 8, stock: 28,
      serviceType: 'SERVICE_KIT',
      compatibleVehicles: ['206 تیپ 5', '207', 'رانا پلاس', 'TU5'],
      categorySlug: 'oils-lubricants',
    },
    {
      name: 'پک روغن سمند ملی بهران رانا (SM 10W40) 4L + فیلتر',
      slug: 'oil-pack-samand-melli-behran-sm-10w40',
      brand: 'بهران',
      description: 'روغن موتور بهران SM 10W40 (۴ لیتر) + فیلتر روغن. مناسب سمند ملی، EF7 و رانا.',
      price: 2_800_000, discountPercent: 12, stock: 45,
      serviceType: 'SERVICE_KIT',
      compatibleVehicles: ['سمند', 'EF7', 'رانا', 'دنا'],
      categorySlug: 'oils-lubricants',
    },

    // --- Supporting parts so every category has real content ---
    {
      name: 'لاستیک پراید ۱۳۵/80R13 باروم',
      slug: 'tire-pride-135-80-r13-barum',
      brand: 'باروم',
      description: 'لاستیک تابستانی باروم ساخت چک، مناسب پراید و تیبا.',
      price: 2_980_000, discountPercent: 8, stock: 24,
      compatibleVehicles: ['پراید', 'تیبا'],
      categorySlug: 'wheels-tires',
    },
    {
      name: 'لاستیک ۲۰۶ ۱۸۵/55R14 یو هافسکم',
      slug: 'tire-206-185-55-r14',
      brand: 'یوهافسکم',
      description: 'لاستیک رادیال با کیفیت اروپایی، مناسب پژو ۲۰۶ و رانا.',
      price: 4_120_000, discountPercent: 15, stock: 18,
      compatibleVehicles: ['پژو 206', 'رانا'],
      categorySlug: 'wheels-tires',
    },
    {
      name: 'باتری ۶۶ آمپر اتمی صبا',
      slug: 'battery-66ah-saba',
      brand: 'صبا',
      description: 'باتری اتمی ۶۶ آمپر با ۱۸ ماه ضمانت، مناسب پژو ۴۰۵ و سمند.',
      price: 5_890_000, discountPercent: 24, stock: 16,
      compatibleVehicles: ['پژو 405', 'سمند', 'پارس'],
      categorySlug: 'car-electrical',
    },
    {
      name: 'باتری ۵۵ آمپر آزاد',
      slug: 'battery-55ah-azad',
      brand: 'آزاد',
      description: 'باتری ورق ضخیم ۵۵ آمپر مخصوص پراید و ۲۰۶، با نصب رایگان.',
      price: 4_350_000, discountPercent: 20, stock: 22,
      compatibleVehicles: ['پراید', 'پژو 206', 'تیبا'],
      categorySlug: 'car-electrical',
    },
    {
      name: 'لنت ترمز جلو پژو 405 فرام (ست ۴ عدد)',
      slug: 'brake-pads-peugeot405-front-fram',
      brand: 'فرام',
      description: 'لنت ترمز جلو فرام استاندارد، مناسب پژو ۴۰۵ و پارس.',
      price: 1_950_000, discountPercent: 14, stock: 28,
      compatibleVehicles: ['پژو 405', 'پارس'],
      categorySlug: 'spare-parts',
    },
    {
      name: 'فیلتر هوا سمند EF7 ایران‌رادیاتور',
      slug: 'air-filter-samand-ef7',
      brand: 'ایران‌رادیاتور',
      description: 'فیلتر هوای اصلی با کاغذ اروپایی، مناسب سمند EF7 و دنا.',
      price: 680_000, stock: 35,
      compatibleVehicles: ['سمند', 'EF7', 'دنا'],
      categorySlug: 'spare-parts',
    },
    {
      name: 'شامپو خودرو ۲ لیتری واکس‌دار',
      slug: 'car-shampoo-wax-2l',
      brand: 'رینو',
      description: 'شامپو واکس‌دار، حفظ براقی رنگ بدنه، فاقد اسید.',
      price: 320_000, discountPercent: 25, stock: 70,
      categorySlug: 'car-care',
    },
    {
      name: 'خوشبوکننده کابین مدل شیشه‌ای ویگال',
      slug: 'air-freshener-glass-vigal',
      brand: 'ویگال',
      description: 'خوشبوکننده کابین با دوام حدود ۳۰ روز.',
      price: 180_000, stock: 90,
      categorySlug: 'car-care',
    },
    {
      name: 'روغن موتور موتورسیکلت 2T پالس (۱ لیتر)',
      slug: 'oil-moto-2t-1l',
      brand: 'پالس',
      description: 'روغن موتور موتورسیکلت دو زمانه، استاندارد JASO-FA.',
      price: 260_000, stock: 50,
      compatibleVehicles: ['هوندا', 'یاماها'],
      categorySlug: 'motorcycle',
    },
  ];

  const productIds: Record<string, { id: number; price: number; final: number }> = {};
  for (const p of products) {
    const data = {
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      description: p.description,
      price: p.price,
      discountPercent: p.discountPercent ?? 0,
      stock: p.stock,
      serviceType: p.serviceType ?? ('PRODUCT' as const),
      compatibleVehicles: p.compatibleVehicles ?? [],
      categoryId: categories[p.categorySlug].id,
    };
    const row = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
    productIds[p.slug] = { id: row.id, price: p.price, final: finalPrice(p.price, p.discountPercent) };
  }
  console.log(`✓ ${products.length} products seeded (6 service kits + parts)`);

  // 5. City-scoped inventory/pricing for isfahan & tehran.
  //    CityProduct.price is the PRE-discount city list price (the discount
  //    percent applies on top in the API); isfahan runs ~3% cheaper.
  for (const citySlug of ['isfahan', 'tehran']) {
    for (const [slug, p] of Object.entries(productIds)) {
      const cityListPrice =
        citySlug === 'isfahan' ? Math.round(p.price * 0.97) : p.price;
      await prisma.cityProduct.upsert({
        where: {
          cityId_productId: {
            cityId: cities[citySlug].id,
            productId: p.id,
          },
        },
        update: { price: cityListPrice, stock: 5 + (p.id % 40), active: true },
        create: {
          cityId: cities[citySlug].id,
          productId: p.id,
          price: cityListPrice,
          stock: 5 + (p.id % 40),
          active: true,
        },
      });
    }
  }
  console.log('✓ City prices seeded (isfahan, tehran)');

  // 6. Banners — the two from the spec (+ a Digipay installment banner)
  const banners = [
    {
      title: 'ارسال رایگان به سراسر ایران',
      subtitle: 'لنت و لوازم یدکی',
      link: '/city/isfahan/category/spare-parts',
      cityId: null as number | null,
      sortOrder: 1,
    },
    {
      title: 'تا 24% تخفیف انواع باتری',
      subtitle: 'خرید قسطی با درگاه دیجی‌پی',
      link: '/city/isfahan/category/car-electrical',
      cityId: null as number | null,
      sortOrder: 2,
    },
    {
      title: 'پک‌های تعویض روغن خودرو',
      subtitle: 'روغن و فیلتر با تعویض در محل',
      link: '/city/isfahan/category/oils-lubricants',
      cityId: null as number | null,
      sortOrder: 3,
    },
  ];

  for (const banner of banners) {
    const exists = await prisma.banner.findFirst({
      where: { title: banner.title },
    });
    if (!exists) {
      await prisma.banner.create({ data: { ...banner, active: true } });
    }
  }
  console.log('✓ Banners seeded');

  // 7. Local vendors — "فروشنده‌های شهر شما"
  const vendors = [
    // Isfahan
    { citySlug: 'isfahan', name: 'مکانیکی مدین‌آباد', address: 'اصفهان، خیابان جی، کوچه گلستان', rating: 4.8, services: ['تعویض روغن', 'مکانیکی'] },
    { citySlug: 'isfahan', name: 'باتری‌سازی اصفهان نور', address: 'اصفهان، سپاهان شهر، بلوار غدیر', rating: 4.6, services: ['باتری‌سازی', 'برق خودرو'] },
    { citySlug: 'isfahan', name: 'لاستیک‌فروشی رینگ پلاس', address: 'اصفهان، بزرگراه شهید خرازی', rating: 4.7, services: ['تعویض لاستیک', 'بالانس'] },
    { citySlug: 'isfahan', name: 'سرویس ویژه کارشناسان', address: 'اصفهان، مرداویج، خیابان مشتاق دوم', rating: 4.5, services: ['تعویض روغن', 'فیلتر'] },
    // Tehran
    { citySlug: 'tehran', name: 'گاراژ تخصصی تهران‌کار', address: 'تهران، شهرک غرب، فاز ۲', rating: 4.9, services: ['تعویض روغن', 'مکانیکی', 'برق خودرو'] },
    { citySlug: 'tehran', name: 'باتری‌سازی مرکز تهران', address: 'تهران، خیابان انقلاب، نزدیک آزمایشگاه', rating: 4.4, services: ['باتری‌سازی'] },
    { citySlug: 'tehran', name: 'لاستیک ایرانیان ویلا', address: 'تهران، جردن، بلوار گلشهر', rating: 4.6, services: ['تعویض لاستیک', 'بالانس', 'تنظیم فرمان'] },
  ] as const;

  for (const vendor of vendors) {
    const exists = await prisma.vendor.findFirst({
      where: { name: vendor.name, cityId: cities[vendor.citySlug].id },
    });
    if (!exists) {
      await prisma.vendor.create({
        data: {
          name: vendor.name,
          cityId: cities[vendor.citySlug].id,
          address: vendor.address,
          rating: vendor.rating,
          services: [...vendor.services],
          isActive: true,
        },
      });
    }
  }
  console.log('✓ Vendors seeded (isfahan, tehran)');

  console.log('🎉 Automotive seeding finished!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
