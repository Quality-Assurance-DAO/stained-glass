-- CreateTable
CREATE TABLE "churches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "floor_plan_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "churches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "windows" (
    "id" TEXT NOT NULL,
    "church_id" TEXT NOT NULL,
    "location_description" TEXT,
    "coordinates_on_plan" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "app_id" TEXT NOT NULL,
    "contribution_count" INTEGER NOT NULL DEFAULT 0,
    "quality_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("app_id")
);

-- CreateTable
CREATE TABLE "photo_submissions" (
    "id" TEXT NOT NULL,
    "window_id" TEXT,
    "user_id" TEXT NOT NULL,
    "arweave_tx_id" TEXT,
    "cardano_tx_id" TEXT,
    "image_hash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "location_verified" BOOLEAN NOT NULL DEFAULT true,
    "ai_classification" JSONB,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_trail" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cardano_tx_id" TEXT,
    "metadata" JSONB,
    "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_queue" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "queue_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "churches_county_town_idx" ON "churches"("county", "town");

-- CreateIndex
CREATE INDEX "churches_name_idx" ON "churches"("name");

-- CreateIndex
CREATE INDEX "churches_county_town_name_idx" ON "churches"("county", "town", "name");

-- CreateIndex
CREATE UNIQUE INDEX "churches_name_county_town_latitude_longitude_key" ON "churches"("name", "county", "town", "latitude", "longitude");

-- CreateIndex
CREATE INDEX "windows_church_id_idx" ON "windows"("church_id");

-- CreateIndex
CREATE INDEX "photo_submissions_window_id_idx" ON "photo_submissions"("window_id");

-- CreateIndex
CREATE INDEX "photo_submissions_user_id_idx" ON "photo_submissions"("user_id");

-- CreateIndex
CREATE INDEX "photo_submissions_image_hash_idx" ON "photo_submissions"("image_hash");

-- CreateIndex
CREATE INDEX "photo_submissions_deleted_at_idx" ON "photo_submissions"("deleted_at");

-- CreateIndex
CREATE INDEX "photo_submissions_window_id_image_hash_timestamp_idx" ON "photo_submissions"("window_id", "image_hash", "timestamp");

-- CreateIndex
CREATE INDEX "audit_trail_submission_id_idx" ON "audit_trail"("submission_id");

-- CreateIndex
CREATE INDEX "audit_trail_cardano_tx_id_idx" ON "audit_trail"("cardano_tx_id");

-- CreateIndex
CREATE INDEX "audit_trail_confirmed_at_idx" ON "audit_trail"("confirmed_at");

-- CreateIndex
CREATE INDEX "upload_queue_status_next_retry_at_idx" ON "upload_queue"("status", "next_retry_at");

-- CreateIndex
CREATE INDEX "upload_queue_submission_id_idx" ON "upload_queue"("submission_id");

-- AddForeignKey
ALTER TABLE "windows" ADD CONSTRAINT "windows_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_submissions" ADD CONSTRAINT "photo_submissions_window_id_fkey" FOREIGN KEY ("window_id") REFERENCES "windows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_submissions" ADD CONSTRAINT "photo_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("app_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trail" ADD CONSTRAINT "audit_trail_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "photo_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_queue" ADD CONSTRAINT "upload_queue_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "photo_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
