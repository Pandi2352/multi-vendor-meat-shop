import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { generateId } from '#common/utils';
import {
  InventoryMovementType,
  ProductStatus,
  Role,
  SellMode,
  ShopStatus,
  Unit,
  UserStatus,
  VendorVerificationStatus,
} from '#common/enums';
import { CollectionName } from '../collection-name.enum.js';
import { UserSchema } from '../../modules/users/schemas/user.schema.js';
import { AddressSchema } from '../../modules/users/schemas/address.schema.js';
import { VendorProfileSchema } from '../../modules/vendors/schemas/vendor-profile.schema.js';
import { ShopSchema } from '../../modules/shops/schemas/shop.schema.js';
import { CategorySchema } from '../../modules/categories/schemas/category.schema.js';
import { ProductSchema } from '../../modules/products/schemas/product.schema.js';
import { InventoryBatchSchema } from '../../modules/inventory/schemas/inventory-batch.schema.js';
import { InventoryMovementSchema } from '../../modules/inventory/schemas/inventory-movement.schema.js';
import {
  DEMO_ADMINS,
  DEMO_USERS,
  VIRUDHUNAGAR_CATEGORIES,
  VIRUDHUNAGAR_SHOPS,
} from './virudhunagar-data.js';

// Load .env in standalone mode
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch {
  // .env may be absent or already loaded
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meat_shop';

export async function runVirudhunagarSeed(): Promise<void> {
  console.log(`\n🌱 Connecting to MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  const UserModel =
    mongoose.models[CollectionName.USERS] ||
    mongoose.model(CollectionName.USERS, UserSchema);
  const AddressModel =
    mongoose.models[CollectionName.ADDRESSES] ||
    mongoose.model(CollectionName.ADDRESSES, AddressSchema);
  const VendorProfileModel =
    mongoose.models[CollectionName.VENDOR_PROFILES] ||
    mongoose.model(CollectionName.VENDOR_PROFILES, VendorProfileSchema);
  const ShopModel =
    mongoose.models[CollectionName.SHOPS] ||
    mongoose.model(CollectionName.SHOPS, ShopSchema);
  const CategoryModel =
    mongoose.models[CollectionName.CATEGORIES] ||
    mongoose.model(CollectionName.CATEGORIES, CategorySchema);
  const ProductModel =
    mongoose.models[CollectionName.PRODUCTS] ||
    mongoose.model(CollectionName.PRODUCTS, ProductSchema);
  const InventoryBatchModel =
    mongoose.models[CollectionName.INVENTORY_BATCHES] ||
    mongoose.model(CollectionName.INVENTORY_BATCHES, InventoryBatchSchema);
  const InventoryMovementModel =
    mongoose.models[CollectionName.INVENTORY_MOVEMENTS] ||
    mongoose.model(CollectionName.INVENTORY_MOVEMENTS, InventoryMovementSchema);

  // 1. Seed Categories
  console.log('\n📦 Seeding Categories...');
  const categoryMap = new Map<string, string>();
  for (const cat of VIRUDHUNAGAR_CATEGORIES) {
    let existing = await CategoryModel.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await CategoryModel.create({
        _id: generateId(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        isActive: true,
        parentId: null,
      });
      console.log(`  + Created category: ${cat.name} (${cat.slug})`);
    } else {
      await CategoryModel.updateOne(
        { _id: existing._id },
        { $set: { name: cat.name, description: cat.description, order: cat.order, isActive: true } },
      );
      console.log(`  ✓ Updated category: ${cat.name} (${cat.slug})`);
    }
    categoryMap.set(cat.slug, existing._id);
  }

  // 2. Seed Shops, Vendors, Products, and Live Batches
  console.log('\n🥩 Seeding Real Virudhunagar Butcher Stalls & Inventory...');
  const batchDate = dayjs().format('YYYY-MM-DD');
  const expiresAt = dayjs().endOf('day').toDate();

  for (const shopDef of VIRUDHUNAGAR_SHOPS) {
    // 2a. Vendor Owner User
    let vendorUser = await UserModel.findOne({ email: shopDef.vendorEmail.toLowerCase() });
    if (!vendorUser) {
      vendorUser = await UserModel.create({
        _id: generateId(),
        email: shopDef.vendorEmail.toLowerCase(),
        name: shopDef.vendorOwnerName,
        phone: shopDef.phone,
        role: Role.VENDOR_OWNER,
        status: UserStatus.ACTIVE,
        shopId: null,
      });
      console.log(`  + Created vendor owner: ${shopDef.vendorOwnerName} <${shopDef.vendorEmail}>`);
    }

    // 2b. Vendor Profile
    let vendorProfile = await VendorProfileModel.findOne({ userId: vendorUser._id });
    if (!vendorProfile) {
      vendorProfile = await VendorProfileModel.create({
        _id: generateId(),
        userId: vendorUser._id,
        businessName: shopDef.name,
        ownerName: shopDef.vendorOwnerName,
        fssaiNumber: shopDef.fssaiNumber,
        status: VendorVerificationStatus.APPROVED,
        verifiedAt: new Date(),
      });
      console.log(`  + Created vendor profile for: ${shopDef.name}`);
    }

    // 2c. Shop
    let shop = await ShopModel.findOne({ slug: shopDef.slug });
    const shopData = {
      vendorId: vendorProfile._id,
      name: shopDef.name,
      slug: shopDef.slug,
      description: shopDef.description,
      phone: shopDef.phone,
      address: shopDef.address,
      location: {
        type: 'Point',
        coordinates: [shopDef.location.lng, shopDef.location.lat],
      },
      status: ShopStatus.OPEN,
      openingTime: shopDef.openingTime,
      closingTime: shopDef.closingTime,
      serviceRadiusKm: shopDef.serviceRadiusKm,
      deliveryFeePaise: shopDef.deliveryFeePaise,
      freeDeliveryAbovePaise: shopDef.freeDeliveryAbovePaise,
      images: [],
    };

    if (!shop) {
      shop = await ShopModel.create({
        _id: generateId(),
        ...shopData,
      });
      console.log(`  🏪 Created shop: ${shopDef.name} (${shopDef.address.locality})`);
    } else {
      await ShopModel.updateOne({ _id: shop._id }, { $set: shopData });
      console.log(`  🏪 Updated shop: ${shopDef.name}`);
    }

    // Link shopId to user
    await UserModel.updateOne({ _id: vendorUser._id }, { $set: { shopId: shop._id } });

    // 2d. Products & Opening Inventory
    for (const prodDef of shopDef.products) {
      const categoryId = categoryMap.get(prodDef.categorySlug);
      if (!categoryId) {
        console.warn(`    ! Category slug not found: ${prodDef.categorySlug}`);
        continue;
      }

      let product = await ProductModel.findOne({ shopId: shop._id, slug: prodDef.slug });
      const productPayload = {
        shopId: shop._id,
        categoryId,
        name: prodDef.name,
        slug: prodDef.slug,
        description: prodDef.description,
        images: [],
        sellMode: SellMode.FIXED_WEIGHT,
        unit: Unit.GRAM,
        cutType: prodDef.cutType,
        allowedPreparation: prodDef.allowedPreparation,
        pricePerKgPaise: prodDef.pricePerKgPaise,
        mrpPerKgPaise: prodDef.mrpPerKgPaise,
        minGrams: prodDef.minGrams,
        maxGrams: prodDef.maxGrams,
        stepGrams: prodDef.stepGrams,
        allowedWeightsGrams: prodDef.allowedWeightsGrams,
        status: ProductStatus.ACTIVE,
        isFreshDaily: true,
        storageTemp: '0-4°C',
        shelfLifeDays: 1,
      };

      if (!product) {
        product = await ProductModel.create({
          _id: generateId(),
          ...productPayload,
        });
        console.log(`    🔪 Product: ${prodDef.name} (₹${prodDef.pricePerKgPaise / 100}/kg)`);
      } else {
        await ProductModel.updateOne({ _id: product._id }, { $set: productPayload });
      }

      // Live Daily Opening Inventory Batch
      let batch = await InventoryBatchModel.findOne({
        shopId: shop._id,
        productId: product._id,
        batchDate,
      });

      if (!batch) {
        batch = await InventoryBatchModel.create({
          _id: generateId(),
          shopId: shop._id,
          productId: product._id,
          batchDate,
          totalOpeningGrams: prodDef.openingGrams,
          availableGrams: prodDef.openingGrams,
          reservedGrams: 0,
          expiresAt,
        });

        await InventoryMovementModel.create({
          _id: generateId(),
          shopId: shop._id,
          productId: product._id,
          type: InventoryMovementType.OPENING,
          grams: prodDef.openingGrams,
          availableGramsAfter: prodDef.openingGrams,
          reservedGramsAfter: 0,
          referenceType: 'OPENING',
          referenceId: null,
          actorId: vendorUser._id,
          notes: 'Daily fresh morning opening stock batch',
        });
      } else {
        await InventoryBatchModel.updateOne(
          { _id: batch._id },
          {
            $set: {
              totalOpeningGrams: prodDef.openingGrams,
              availableGrams: prodDef.openingGrams,
              reservedGrams: 0,
              expiresAt,
            },
          },
        );
      }
    }
  }

  // 3. Demo Customer & Delivery Partner
  console.log('\n👥 Seeding Demo Users...');
  const customerEmail = DEMO_USERS.customer.email.toLowerCase();
  let customerUser = await UserModel.findOne({ email: customerEmail });
  if (!customerUser) {
    customerUser = await UserModel.create({
      _id: generateId(),
      email: customerEmail,
      name: DEMO_USERS.customer.name,
      phone: DEMO_USERS.customer.phone,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      shopId: null,
    });
    console.log(`  + Created demo customer: ${customerUser.name} <${customerEmail}>`);
  }

  const existingAddr = await AddressModel.findOne({ userId: customerUser._id });
  if (!existingAddr) {
    await AddressModel.create({
      _id: generateId(),
      userId: customerUser._id,
      label: DEMO_USERS.customer.address.label,
      text: DEMO_USERS.customer.address.text,
      pincode: DEMO_USERS.customer.address.pincode,
      district: DEMO_USERS.customer.address.district,
      isDefault: true,
      location: {
        lat: DEMO_USERS.customer.address.lat,
        lng: DEMO_USERS.customer.address.lng,
      },
    });
    console.log(`  + Created demo customer address: Virudhunagar Town (${DEMO_USERS.customer.address.pincode})`);
  }

  const deliveryEmail = DEMO_USERS.deliveryPartner.email.toLowerCase();
  let deliveryUser = await UserModel.findOne({ email: deliveryEmail });
  if (!deliveryUser) {
    deliveryUser = await UserModel.create({
      _id: generateId(),
      email: deliveryEmail,
      name: DEMO_USERS.deliveryPartner.name,
      phone: DEMO_USERS.deliveryPartner.phone,
      role: Role.DELIVERY_PARTNER,
      status: UserStatus.ACTIVE,
      shopId: null,
    });
    console.log(`  + Created delivery partner: ${deliveryUser.name} <${deliveryEmail}>`);
  }

  // Super Admin
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@virudhunagar-meats.in').toLowerCase();
  let superAdmin = await UserModel.findOne({ email: superAdminEmail });
  if (!superAdmin) {
    superAdmin = await UserModel.create({
      _id: generateId(),
      email: superAdminEmail,
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      phone: '+919842100000',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      shopId: null,
    });
    console.log(`  + Created super admin: ${superAdmin.name} <${superAdminEmail}>`);
  }

  // 4. Seed 5 Additional Platform Admin Users
  console.log('\n🛡️ Seeding 5 Platform Admin Users...');
  for (const adminDef of DEMO_ADMINS) {
    const adminEmail = adminDef.email.toLowerCase();
    let existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      existingAdmin = await UserModel.create({
        _id: generateId(),
        email: adminEmail,
        name: adminDef.name,
        phone: adminDef.phone,
        role: adminDef.role,
        status: adminDef.status,
        shopId: null,
      });
      console.log(`  + Created admin user: ${existingAdmin.name} <${adminEmail}> (${adminDef.role})`);
    } else {
      await UserModel.updateOne(
        { _id: existingAdmin._id },
        { $set: { name: adminDef.name, phone: adminDef.phone, role: adminDef.role, status: adminDef.status } },
      );
      console.log(`  ✓ Updated admin user: ${adminDef.name} <${adminEmail}>`);
    }
  }

  console.log('\n✨ Virudhunagar Marketplace Seeding Completed Successfully!');
  console.log('------------------------------------------------------------');
  console.log(`Shops: 5 real stalls (Virudhunagar, Sivakasi, Rajapalayam, Aruppukkottai, Srivilliputhur)`);
  console.log(`Categories: 6 fresh meat & seafood categories`);
  console.log(`Batches: Today's fresh batches active with 10-40kg per cut in integer grams`);
  console.log(`COD Only: All orders set for Cash On Delivery`);
  console.log('------------------------------------------------------------\n');
}

// Execute if run directly from CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.js')) {
  runVirudhunagarSeed()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await mongoose.disconnect();
      process.exit(1);
    });
}
