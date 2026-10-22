#!/usr/bin/env node
/**
 * Bulk-fill product images.
 *
 * Drop product photos into a folder, named by product slug:
 *   oil-pack-bemo-sl-20w50.jpg
 *   pride-brake-pad.png
 *
 * Then run (from apps/api):
 *   node scripts/set-product-images.mjs            # apply
 *   node scripts/set-product-images.mjs --dry-run  # report only, no writes
 *   node scripts/set-product-images.mjs ./another-folder
 *
 * Files are copied to apps/web/public/images/products/ so Next serves
 * them directly as `/images/products/<slug>.<ext>`, and every matching
 * product's `imageUrl` is updated in one pass. Files whose name does
 * not match a product slug are left in place and reported.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';
import { readdir, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const IMAGE_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
]);
const SOURCE_DIR = path.resolve(
  process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'product-images'
);
const CREATED_URL_BASE = '/images/products';
const DEST_DIR = path.resolve(process.cwd(), '../web/public/images/products');
const DRY_RUN = process.argv.includes('--dry-run');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing');
}
const prisma = new PrismaClient({ adapter: PrismaPg({ connectionString }) });

async function main() {
  let entries;
  try {
    entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Folder not found: ${SOURCE_DIR}`);
      console.log('Create it and drop product photos named by product slug there.');
      return;
    }
    throw error;
  }
  const files = entries.filter(
    (entry) => entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase())
  );
  if (files.length === 0) {
    console.log(`No image files found in ${SOURCE_DIR}`);
    console.log('Name files by product slug, e.g. oil-pack-bemo-sl-20w50.jpg');
    return;
  }

  const slugs = files.map((file) => path.basename(file.name, path.extname(file.name)));
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const bySlug = new Map(products.map((product) => [product.slug, product.id]));

  if (!DRY_RUN) {
    await mkdir(DEST_DIR, { recursive: true });
  }

  let updated = 0;
  const unknown = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    const slug = path.basename(file.name, ext);
    const product = bySlug.get(slug);
    if (!product) {
      unknown.push(file.name);
      continue;
    }
    const url = path.posix.join(CREATED_URL_BASE, `${slug}${ext}`);
    if (!DRY_RUN) {
      await copyFile(path.join(SOURCE_DIR, file.name), path.join(DEST_DIR, `${slug}${ext}`));
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: url },
      });
    }
    updated += 1;
  }

  console.log(
    `${DRY_RUN ? '[dry-run] Would update' : 'Updated'} ${updated} product image(s).`
  );
  if (unknown.length) {
    console.log(`\n${unknown.length} file(s) did not match any product slug (left in place):`);
    for (const name of unknown.slice(0, 20)) console.log(`  - ${name}`);
    if (unknown.length > 20) console.log(`  … and ${unknown.length - 20} more`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
