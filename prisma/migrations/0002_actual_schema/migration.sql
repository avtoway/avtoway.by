-- AlterTable
ALTER TABLE "partners" ADD COLUMN "advantages" TEXT;
ALTER TABLE "partners" ADD COLUMN "photos" TEXT;
ALTER TABLE "partners" ADD COLUMN "services" TEXT;
ALTER TABLE "partners" ADD COLUMN "short_description" TEXT;
ALTER TABLE "partners" ADD COLUMN "slug" TEXT;
ALTER TABLE "partners" ADD COLUMN "working_hours" TEXT;

-- CreateTable
CREATE TABLE "vacancies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT NOT NULL DEFAULT 'Минск',
    "employment_type" TEXT NOT NULL DEFAULT 'full_time',
    "work_format" TEXT,
    "experience" TEXT,
    "schedule" TEXT,
    "salary_from" INTEGER,
    "salary_to" INTEGER,
    "salary_currency" TEXT NOT NULL DEFAULT 'BYN',
    "salary_period" TEXT NOT NULL DEFAULT 'month',
    "salary_type" TEXT NOT NULL DEFAULT 'fixed',
    "salary_note" TEXT,
    "short_description" TEXT NOT NULL,
    "description" TEXT,
    "responsibilities" TEXT,
    "requirements" TEXT,
    "conditions" TEXT,
    "benefits" TEXT,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "contact_telegram" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT,
    "email" TEXT,
    "telegram" TEXT,
    "viber" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    "rutube" TEXT,
    "vk" TEXT,
    "address" TEXT,
    "working_hours" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "normalized_phone" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'site',
    "service_slug" TEXT,
    "page_url" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "sent_emails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    "in_reply_to" TEXT,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "inbox_emails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message_id" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "text_body" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "received_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "rent_conditions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "placeholder" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "rent_car_conditions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "car_id" TEXT NOT NULL,
    "condition_id" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "rent_car_conditions_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "rent_cars" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rent_car_conditions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "rent_conditions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rent_pricing_tiers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "min_days" INTEGER NOT NULL,
    "max_days" INTEGER,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "comfort_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "car_classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "deposit" INTEGER,
    "min_age" INTEGER
);

-- CreateTable
CREATE TABLE "rent_extras" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price_type" TEXT NOT NULL DEFAULT 'perDay',
    "price" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "rent_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "car_id" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "normalized_phone" TEXT,
    "email" TEXT,
    "start_date" TEXT,
    "end_date" TEXT,
    "days" INTEGER,
    "extras" TEXT,
    "total" INTEGER,
    "deposit" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'new',
    "message" TEXT,
    "page_url" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rent_requests_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "rent_cars" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rent_car_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "car_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "amount" INTEGER,
    "date" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rent_car_history_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "rent_cars" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "autopodbor_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hero_badge" TEXT,
    "hero_title" TEXT NOT NULL,
    "hero_highlight" TEXT,
    "hero_subtitle" TEXT,
    "hero_image" TEXT,
    "hero_image_alt" TEXT,
    "price_from" INTEGER,
    "cta_primary_label" TEXT NOT NULL DEFAULT 'Подобрать авто',
    "cta_secondary_label" TEXT NOT NULL DEFAULT 'Смотреть тарифы',
    "phone" TEXT,
    "telegram" TEXT,
    "whatsapp" TEXT,
    "viber" TEXT,
    "address" TEXT,
    "working_hours" TEXT,
    "years_experience" INTEGER,
    "cars_checked" INTEGER,
    "cities_count" INTEGER,
    "guarantee_days" INTEGER,
    "avg_savings" INTEGER,
    "report_time" TEXT,
    "expert_name" TEXT,
    "expert_role" TEXT,
    "expert_quote" TEXT,
    "expert_photo" TEXT,
    "expert_facts" TEXT,
    "disclaimer" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_image" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "badge" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "image" TEXT,
    "image_alt" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_tariffs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "group_name" TEXT NOT NULL DEFAULT 'rb',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "price" INTEGER,
    "price_from" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL DEFAULT 'BYN',
    "unit" TEXT,
    "duration" TEXT,
    "includes" TEXT,
    "badge" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'check',
    "image" TEXT,
    "cta_label" TEXT NOT NULL DEFAULT 'Оставить заявку',
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'check',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'advantage',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'shield',
    "stat" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_check_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_cases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "budget" INTEGER,
    "purchase_price" INTEGER,
    "trade_amount" INTEGER,
    "days" INTEGER,
    "city" TEXT,
    "task" TEXT,
    "found" TEXT,
    "result" TEXT,
    "photos" TEXT,
    "main_photo" TEXT,
    "completed_at" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "car" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'site',
    "source_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_faq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_gallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "title" TEXT,
    "alt" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "prompt" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_cities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "autopodbor_promos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "discount" TEXT,
    "valid_until" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "autopodbor_leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "normalized_phone" TEXT,
    "email" TEXT,
    "messenger" TEXT,
    "city" TEXT,
    "budget_from" INTEGER,
    "budget_to" INTEGER,
    "brand" TEXT,
    "model" TEXT,
    "service_slug" TEXT,
    "service_title" TEXT,
    "comment" TEXT,
    "quiz" TEXT,
    "source" TEXT NOT NULL DEFAULT 'form',
    "status" TEXT NOT NULL DEFAULT 'new',
    "price_quoted" INTEGER,
    "assigned_to_id" TEXT,
    "internal_note" TEXT,
    "page_url" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "autopodbor_leads_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sale_cars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand_id" TEXT,
    "model_id" TEXT,
    "generation" TEXT,
    "price_usd" INTEGER NOT NULL,
    "price_byn" INTEGER,
    "old_price_usd" INTEGER,
    "is_negotiable" BOOLEAN NOT NULL DEFAULT true,
    "allow_exchange" BOOLEAN NOT NULL DEFAULT false,
    "allow_credit" BOOLEAN NOT NULL DEFAULT false,
    "year" INTEGER NOT NULL,
    "mileage_km" INTEGER NOT NULL,
    "body_type" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "engine_volume" REAL,
    "engine_power_hp" INTEGER,
    "drive_type" TEXT NOT NULL,
    "color" TEXT,
    "interior_material" TEXT,
    "interior_color" TEXT,
    "steering" TEXT NOT NULL DEFAULT 'left',
    "seats" INTEGER DEFAULT 5,
    "doors" INTEGER DEFAULT 4,
    "condition" TEXT NOT NULL DEFAULT 'used',
    "owners_count" TEXT,
    "origin_country" TEXT,
    "customs_cleared" BOOLEAN NOT NULL DEFAULT true,
    "vin" TEXT,
    "vin_verified" BOOLEAN NOT NULL DEFAULT false,
    "original_paint" BOOLEAN NOT NULL DEFAULT false,
    "no_accidents" BOOLEAN NOT NULL DEFAULT false,
    "service_book" BOOLEAN NOT NULL DEFAULT false,
    "is_inspected" BOOLEAN NOT NULL DEFAULT true,
    "expert_summary" TEXT,
    "body_check_note" TEXT,
    "tech_check_note" TEXT,
    "legal_check_note" TEXT,
    "diagnostics_pdf" TEXT,
    "features" TEXT,
    "custom_specs" TEXT,
    "description" TEXT,
    "main_photo" TEXT,
    "photos" TEXT,
    "video_url" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Минск',
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sale_cars_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "car_brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sale_cars_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "car_models" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sale_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'buy',
    "car_id" TEXT,
    "client_name" TEXT NOT NULL,
    "client_phone" TEXT NOT NULL,
    "normalized_phone" TEXT,
    "car_info" TEXT,
    "offer_price" INTEGER,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "page_url" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sale_requests_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "sale_cars" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "service_landings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "seo_title" TEXT NOT NULL,
    "seo_description" TEXT NOT NULL,
    "og_title" TEXT,
    "og_description" TEXT,
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "lead_meta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "rejection_reason" TEXT,
    "next_contact_at" DATETIME,
    "internal_note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "lead_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "user_id" TEXT,
    "author" TEXT,
    "text" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "lead_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "lead_id" TEXT,
    "client_phone" TEXT,
    "title" TEXT NOT NULL,
    "due_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assigned_to_id" TEXT,
    "created_by_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateTable
CREATE TABLE "system_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL DEFAULT 'error',
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "inspection_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "lead_id" TEXT,
    "client_name" TEXT,
    "client_phone" TEXT,
    "car_title" TEXT NOT NULL,
    "vin" TEXT,
    "mileage_km" INTEGER,
    "inspected_at" TEXT,
    "verdict" TEXT NOT NULL DEFAULT 'recommended',
    "summary" TEXT,
    "checklist" TEXT,
    "expenses" TEXT,
    "photos" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover" TEXT,
    "category" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "promotion_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "budget" INTEGER,
    "spend" INTEGER,
    "start_date" TEXT,
    "end_date" TEXT,
    "target_url" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ad_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "html" TEXT,
    "image_url" TEXT,
    "target_url" TEXT,
    "height" INTEGER NOT NULL DEFAULT 250,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" DATETIME,
    "ends_at" DATETIME,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_audit_logs" ("action", "created_at", "details", "entity", "entity_id", "id", "user_id") SELECT "action", "created_at", "details", "entity", "entity_id", "id", "user_id" FROM "audit_logs";
DROP TABLE "audit_logs";
ALTER TABLE "new_audit_logs" RENAME TO "audit_logs";
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
CREATE TABLE "new_rent_cars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand_id" TEXT,
    "model_id" TEXT,
    "class_id" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "transmission" TEXT,
    "fuel" TEXT,
    "engine_volume" TEXT,
    "seats" INTEGER,
    "features" TEXT,
    "photos" TEXT,
    "main_photo" TEXT,
    "description" TEXT,
    "taxi_requirements" TEXT,
    "price_day" INTEGER,
    "price_7days" INTEGER,
    "price_day_taxi" INTEGER,
    "rent_type_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "booked_until" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "rent_cars_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "car_brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rent_cars_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "car_models" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rent_cars_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "car_classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rent_cars_rent_type_id_fkey" FOREIGN KEY ("rent_type_id") REFERENCES "rent_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_rent_cars" ("color", "created_at", "description", "engine_volume", "features", "fuel", "id", "is_active", "main_photo", "name", "photos", "price_7days", "price_day", "price_day_taxi", "rent_type_id", "seats", "slug", "sort_order", "transmission", "updated_at", "year") SELECT "color", "created_at", "description", "engine_volume", "features", "fuel", "id", "is_active", "main_photo", "name", "photos", "price_7days", "price_day", "price_day_taxi", "rent_type_id", "seats", "slug", "sort_order", "transmission", "updated_at", "year" FROM "rent_cars";
DROP TABLE "rent_cars";
ALTER TABLE "new_rent_cars" RENAME TO "rent_cars";
CREATE UNIQUE INDEX "rent_cars_slug_key" ON "rent_cars"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "vacancies_slug_key" ON "vacancies"("slug");

-- CreateIndex
CREATE INDEX "vacancies_is_active_sort_order_idx" ON "vacancies"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "vacancies_published_at_idx" ON "vacancies"("published_at");

-- CreateIndex
CREATE INDEX "contact_requests_status_idx" ON "contact_requests"("status");

-- CreateIndex
CREATE INDEX "contact_requests_created_at_idx" ON "contact_requests"("created_at");

-- CreateIndex
CREATE INDEX "contact_requests_source_idx" ON "contact_requests"("source");

-- CreateIndex
CREATE INDEX "contact_requests_service_slug_idx" ON "contact_requests"("service_slug");

-- CreateIndex
CREATE INDEX "contact_requests_normalized_phone_idx" ON "contact_requests"("normalized_phone");

-- CreateIndex
CREATE INDEX "sent_emails_sent_at_idx" ON "sent_emails"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "inbox_emails_message_id_key" ON "inbox_emails"("message_id");

-- CreateIndex
CREATE INDEX "inbox_emails_received_at_idx" ON "inbox_emails"("received_at");

-- CreateIndex
CREATE INDEX "inbox_emails_is_read_idx" ON "inbox_emails"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "rent_conditions_name_key" ON "rent_conditions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rent_conditions_slug_key" ON "rent_conditions"("slug");

-- CreateIndex
CREATE INDEX "rent_car_conditions_condition_id_idx" ON "rent_car_conditions"("condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "rent_car_conditions_car_id_condition_id_key" ON "rent_car_conditions"("car_id", "condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "comfort_features_name_key" ON "comfort_features"("name");

-- CreateIndex
CREATE UNIQUE INDEX "comfort_features_slug_key" ON "comfort_features"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "car_classes_name_key" ON "car_classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "car_classes_slug_key" ON "car_classes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "rent_extras_slug_key" ON "rent_extras"("slug");

-- CreateIndex
CREATE INDEX "rent_requests_status_idx" ON "rent_requests"("status");

-- CreateIndex
CREATE INDEX "rent_requests_created_at_idx" ON "rent_requests"("created_at");

-- CreateIndex
CREATE INDEX "rent_requests_normalized_phone_idx" ON "rent_requests"("normalized_phone");

-- CreateIndex
CREATE INDEX "rent_car_history_car_id_idx" ON "rent_car_history"("car_id");

-- CreateIndex
CREATE UNIQUE INDEX "autopodbor_sections_key_key" ON "autopodbor_sections"("key");

-- CreateIndex
CREATE INDEX "autopodbor_sections_is_active_sort_order_idx" ON "autopodbor_sections"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "autopodbor_tariffs_slug_key" ON "autopodbor_tariffs"("slug");

-- CreateIndex
CREATE INDEX "autopodbor_tariffs_group_name_is_active_sort_order_idx" ON "autopodbor_tariffs"("group_name", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "autopodbor_features_type_is_active_sort_order_idx" ON "autopodbor_features"("type", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "autopodbor_check_items_category_is_active_sort_order_idx" ON "autopodbor_check_items"("category", "is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "autopodbor_cases_slug_key" ON "autopodbor_cases"("slug");

-- CreateIndex
CREATE INDEX "autopodbor_cases_is_active_sort_order_idx" ON "autopodbor_cases"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "autopodbor_reviews_is_published_sort_order_idx" ON "autopodbor_reviews"("is_published", "sort_order");

-- CreateIndex
CREATE INDEX "autopodbor_gallery_section_is_active_sort_order_idx" ON "autopodbor_gallery"("section", "is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "autopodbor_cities_name_key" ON "autopodbor_cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "autopodbor_cities_slug_key" ON "autopodbor_cities"("slug");

-- CreateIndex
CREATE INDEX "autopodbor_leads_status_created_at_idx" ON "autopodbor_leads"("status", "created_at");

-- CreateIndex
CREATE INDEX "autopodbor_leads_service_slug_idx" ON "autopodbor_leads"("service_slug");

-- CreateIndex
CREATE INDEX "autopodbor_leads_normalized_phone_idx" ON "autopodbor_leads"("normalized_phone");

-- CreateIndex
CREATE UNIQUE INDEX "sale_cars_slug_key" ON "sale_cars"("slug");

-- CreateIndex
CREATE INDEX "sale_cars_status_is_active_sort_order_idx" ON "sale_cars"("status", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "sale_cars_brand_id_model_id_idx" ON "sale_cars"("brand_id", "model_id");

-- CreateIndex
CREATE INDEX "sale_cars_price_usd_idx" ON "sale_cars"("price_usd");

-- CreateIndex
CREATE INDEX "sale_cars_year_idx" ON "sale_cars"("year");

-- CreateIndex
CREATE INDEX "sale_requests_status_created_at_idx" ON "sale_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "sale_requests_car_id_idx" ON "sale_requests"("car_id");

-- CreateIndex
CREATE INDEX "sale_requests_normalized_phone_idx" ON "sale_requests"("normalized_phone");

-- CreateIndex
CREATE UNIQUE INDEX "service_landings_slug_key" ON "service_landings"("slug");

-- CreateIndex
CREATE INDEX "lead_meta_assigned_to_id_idx" ON "lead_meta"("assigned_to_id");

-- CreateIndex
CREATE INDEX "lead_meta_next_contact_at_idx" ON "lead_meta"("next_contact_at");

-- CreateIndex
CREATE UNIQUE INDEX "lead_meta_source_lead_id_key" ON "lead_meta"("source", "lead_id");

-- CreateIndex
CREATE INDEX "lead_notes_source_lead_id_created_at_idx" ON "lead_notes"("source", "lead_id", "created_at");

-- CreateIndex
CREATE INDEX "lead_notes_created_at_idx" ON "lead_notes"("created_at");

-- CreateIndex
CREATE INDEX "lead_tasks_status_due_at_idx" ON "lead_tasks"("status", "due_at");

-- CreateIndex
CREATE INDEX "lead_tasks_source_lead_id_idx" ON "lead_tasks"("source", "lead_id");

-- CreateIndex
CREATE INDEX "lead_tasks_client_phone_idx" ON "lead_tasks"("client_phone");

-- CreateIndex
CREATE INDEX "system_events_level_created_at_idx" ON "system_events"("level", "created_at");

-- CreateIndex
CREATE INDEX "system_events_source_created_at_idx" ON "system_events"("source", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_reports_token_key" ON "inspection_reports"("token");

-- CreateIndex
CREATE INDEX "inspection_reports_is_published_created_at_idx" ON "inspection_reports"("is_published", "created_at");

-- CreateIndex
CREATE INDEX "inspection_reports_lead_id_idx" ON "inspection_reports"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_is_published_published_at_idx" ON "blog_posts"("is_published", "published_at");

-- CreateIndex
CREATE INDEX "promotion_campaigns_status_created_at_idx" ON "promotion_campaigns"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ad_slots_key_key" ON "ad_slots"("key");

-- CreateIndex
CREATE UNIQUE INDEX "partners_slug_key" ON "partners"("slug");

