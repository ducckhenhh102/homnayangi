-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(240) NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "price_min" INTEGER,
    "price_max" INTEGER,
    "status" "RestaurantStatus" NOT NULL DEFAULT 'DRAFT',
    "opening_hours" JSONB,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(240) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_foods" (
    "restaurant_id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "price_vnd" INTEGER,
    "is_available" BOOLEAN DEFAULT true,

    CONSTRAINT "restaurant_foods_pkey" PRIMARY KEY ("restaurant_id","food_id")
);

-- CreateTable
CREATE TABLE "dining_types" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "dining_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_dining_types" (
    "restaurant_id" TEXT NOT NULL,
    "dining_type_id" TEXT NOT NULL,

    CONSTRAINT "restaurant_dining_types_pkey" PRIMARY KEY ("restaurant_id","dining_type_id")
);

-- CreateTable
CREATE TABLE "companion_types" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "companion_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_companion_types" (
    "restaurant_id" TEXT NOT NULL,
    "companion_type_id" TEXT NOT NULL,
    "suitability_score" INTEGER DEFAULT 100,

    CONSTRAINT "restaurant_companion_types_pkey" PRIMARY KEY ("restaurant_id","companion_type_id")
);

-- CreateTable
CREATE TABLE "restaurant_images" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "cloudinary_public_id" TEXT NOT NULL,
    "secure_url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "rights_source" VARCHAR(255),
    "uploaded_by" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_images" (
    "id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "cloudinary_public_id" TEXT NOT NULL,
    "secure_url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_provider_links" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_place_id" VARCHAR(255) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_provider_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100),
    "role" VARCHAR(50) NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE INDEX "restaurants_status_idx" ON "restaurants"("status");

-- CreateIndex
CREATE INDEX "restaurants_slug_idx" ON "restaurants"("slug");

-- CreateIndex
CREATE INDEX "restaurants_latitude_longitude_idx" ON "restaurants"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "foods_slug_key" ON "foods"("slug");

-- CreateIndex
CREATE INDEX "foods_slug_idx" ON "foods"("slug");

-- CreateIndex
CREATE INDEX "restaurant_dining_types_restaurant_id_dining_type_id_idx" ON "restaurant_dining_types"("restaurant_id", "dining_type_id");

-- CreateIndex
CREATE INDEX "restaurant_companion_types_restaurant_id_companion_type_id_idx" ON "restaurant_companion_types"("restaurant_id", "companion_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_images_cloudinary_public_id_key" ON "restaurant_images"("cloudinary_public_id");

-- CreateIndex
CREATE INDEX "restaurant_images_restaurant_id_sort_order_idx" ON "restaurant_images"("restaurant_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "food_images_cloudinary_public_id_key" ON "food_images"("cloudinary_public_id");

-- CreateIndex
CREATE INDEX "food_images_food_id_sort_order_idx" ON "food_images"("food_id", "sort_order");

-- CreateIndex
CREATE INDEX "restaurant_provider_links_provider_provider_place_id_idx" ON "restaurant_provider_links"("provider", "provider_place_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_provider_links_provider_provider_place_id_key" ON "restaurant_provider_links"("provider", "provider_place_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_foods" ADD CONSTRAINT "restaurant_foods_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_foods" ADD CONSTRAINT "restaurant_foods_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_dining_types" ADD CONSTRAINT "restaurant_dining_types_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_dining_types" ADD CONSTRAINT "restaurant_dining_types_dining_type_id_fkey" FOREIGN KEY ("dining_type_id") REFERENCES "dining_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_companion_types" ADD CONSTRAINT "restaurant_companion_types_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_companion_types" ADD CONSTRAINT "restaurant_companion_types_companion_type_id_fkey" FOREIGN KEY ("companion_type_id") REFERENCES "companion_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_images" ADD CONSTRAINT "restaurant_images_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_images" ADD CONSTRAINT "food_images_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_provider_links" ADD CONSTRAINT "restaurant_provider_links_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
