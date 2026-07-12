-- ═══════════════════════════════════════════════════════════════
-- migrations/011_industry_category.sql
-- Adds industry_category to profiles for analytics grouping.
-- The industry column stays as-is (now stores granular values like
-- 'hair_salon', 'poultry_farming', etc. from the new industry list).
-- industry_category is a denormalised field for faster analytics queries.
-- Safe to run multiple times (all use IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════

-- 1. Add industry_category column for analytics
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS industry_category TEXT;

-- 2. Add index for analytics queries by category
CREATE INDEX IF NOT EXISTS idx_profiles_industry_category
  ON profiles (industry_category);

CREATE INDEX IF NOT EXISTS idx_profiles_industry
  ON profiles (industry);

-- 3. Backfill industry_category from existing industry values
-- Maps old 12-value industry to new category system for existing users
UPDATE profiles
SET industry_category = CASE
  WHEN industry IN ('fashion_clothing', 'tailoring_bespoke', 'ready_to_wear', 'ankara_fabric_fashion',
    'mens_fashion', 'childrens_fashion', 'shoes_footwear', 'accessories_jewellery',
    'fabrics_textile', 'thrift_okrika') THEN 'fashion'

  WHEN industry IN ('food_restaurants', 'restaurant_eatery', 'fast_food', 'catering_event_food',
    'pastry_bakery', 'small_chop_street_food', 'suya_bbq', 'drinks_beverages',
    'food_processing', 'snacks_production') THEN 'food_drinks'

  WHEN industry IN ('beauty_cosmetics', 'hair_salon', 'barber_shop', 'skincare_cosmetics',
    'nail_salon', 'makeup_artistry', 'wig_hairpiece', 'spa_massage',
    'perfume_fragrance', 'beauty_training') THEN 'beauty'

  WHEN industry IN ('healthcare_wellness', 'pharmacy_chemist', 'private_clinic',
    'dental_clinic', 'optician_eyecare', 'gym_fitness', 'physiotherapy',
    'mental_health', 'herbal_medicine', 'medical_lab', 'maternity_childhealth',
    'dietitian_nutrition') THEN 'health'

  WHEN industry IN ('real_estate', 'real_estate_agency', 'property_development',
    'short_let_airbnb', 'facility_management', 'interior_design', 'furniture') THEN 'real_estate'

  WHEN industry IN ('construction_building', 'electrical_installation', 'plumbing',
    'air_conditioning', 'solar_energy', 'tile_flooring', 'painting_finishing',
    'aluminium_windows', 'welding_fabrication') THEN 'construction'

  WHEN industry IN ('technology_software', 'software_development', 'mobile_app_dev',
    'website_design', 'it_support', 'digital_marketing', 'graphic_design',
    'video_production', 'photography_business', 'pos_payment',
    'social_media_management', 'data_cybersecurity') THEN 'technology'

  WHEN industry IN ('education_training', 'private_tutoring', 'private_school',
    'vocational_skills', 'online_courses', 'exam_coaching', 'driving_school',
    'language_school', 'music_arts_school', 'child_daycare') THEN 'education'

  WHEN industry IN ('logistics_delivery', 'dispatch_delivery', 'long_distance_haulage',
    'ride_hailing', 'car_hire', 'moving_relocation', 'freight_forwarding',
    'courier_express', 'tricycle_keke') THEN 'logistics'

  WHEN industry IN ('finance_fintech', 'accounting_bookkeeping', 'tax_consulting',
    'insurance_agency', 'business_consulting', 'hr_consulting', 'legal_services',
    'immigration_consulting', 'microfinance', 'investment_advisory') THEN 'finance_professional'

  WHEN industry IN ('ecommerce_retail', 'online_store_general', 'phones_electronics',
    'supermarket_minimart', 'baby_children_store', 'home_appliances_store',
    'building_materials', 'auto_spare_parts', 'books_stationery',
    'gifts_crafts_souvenirs', 'sports_equipment') THEN 'retail'

  WHEN industry IN ('events_entertainment', 'event_planning', 'wedding_planning',
    'venue_rental', 'dj_entertainment', 'event_decor', 'hotel_guesthouse',
    'travel_tourism', 'bar_lounge_club') THEN 'events_hospitality'

  WHEN industry IN ('crop_farming', 'poultry_farming', 'fish_farming', 'cattle_livestock',
    'agro_processing', 'organic_farming', 'farm_input_supply', 'horticulture') THEN 'agriculture'

  WHEN industry IN ('music_production', 'acting_film', 'blogging_content',
    'youtube_tiktok_creator', 'printing_branding', 'animation_motion',
    'pr_publicity', 'podcast_radio', 'influencer_creator') THEN 'media_content'

  WHEN industry IN ('auto_mechanic', 'car_wash', 'car_dealership', 'auto_body_paint',
    'tyre_vulcanizing', 'auto_electrical') THEN 'auto'

  WHEN industry IN ('cleaning_services', 'laundry_drycleaning', 'home_security_cctv',
    'domestic_staffing', 'elderly_care', 'waste_recycling') THEN 'home_services'

  WHEN industry IN ('ngo_foundation', 'church_religious', 'community_development') THEN 'ngo_religious'

  ELSE 'other'
END
WHERE industry IS NOT NULL AND industry_category IS NULL;

-- 4. Function to auto-set industry_category on INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.set_industry_category()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.industry IS NOT NULL THEN
    NEW.industry_category := CASE
      WHEN NEW.industry ILIKE '%fashion%' OR NEW.industry IN ('tailoring_bespoke','ready_to_wear','ankara_fabric_fashion','mens_fashion','childrens_fashion','shoes_footwear','accessories_jewellery','fabrics_textile','thrift_okrika') THEN 'fashion'
      WHEN NEW.industry ILIKE '%food%' OR NEW.industry ILIKE '%restaurant%' OR NEW.industry ILIKE '%catering%' OR NEW.industry ILIKE '%bakery%' OR NEW.industry ILIKE '%suya%' OR NEW.industry ILIKE '%snack%' OR NEW.industry IN ('restaurant_eatery','fast_food','catering_event_food','pastry_bakery','small_chop_street_food','suya_bbq','drinks_beverages','food_processing','snacks_production') THEN 'food_drinks'
      WHEN NEW.industry ILIKE '%beauty%' OR NEW.industry ILIKE '%hair%' OR NEW.industry ILIKE '%nail%' OR NEW.industry ILIKE '%makeup%' OR NEW.industry IN ('hair_salon','barber_shop','skincare_cosmetics','nail_salon','makeup_artistry','wig_hairpiece','spa_massage','perfume_fragrance','beauty_training') THEN 'beauty'
      WHEN NEW.industry ILIKE '%health%' OR NEW.industry ILIKE '%clinic%' OR NEW.industry ILIKE '%pharmacy%' OR NEW.industry IN ('pharmacy_chemist','private_clinic','dental_clinic','optician_eyecare','gym_fitness','physiotherapy','mental_health','herbal_medicine','medical_lab','maternity_childhealth','dietitian_nutrition') THEN 'health'
      WHEN NEW.industry ILIKE '%real_estate%' OR NEW.industry IN ('real_estate_agency','property_development','short_let_airbnb','facility_management','interior_design','furniture') THEN 'real_estate'
      WHEN NEW.industry IN ('construction_building','electrical_installation','plumbing','air_conditioning','solar_energy','tile_flooring','painting_finishing','aluminium_windows','welding_fabrication') THEN 'construction'
      WHEN NEW.industry ILIKE '%tech%' OR NEW.industry ILIKE '%software%' OR NEW.industry ILIKE '%digital%' OR NEW.industry IN ('software_development','mobile_app_dev','website_design','it_support','digital_marketing','graphic_design','video_production','photography_business','pos_payment','social_media_management','data_cybersecurity') THEN 'technology'
      WHEN NEW.industry ILIKE '%educat%' OR NEW.industry IN ('private_tutoring','private_school','vocational_skills','online_courses','exam_coaching','driving_school','language_school','music_arts_school','child_daycare') THEN 'education'
      WHEN NEW.industry ILIKE '%logistic%' OR NEW.industry ILIKE '%delivery%' OR NEW.industry IN ('dispatch_delivery','long_distance_haulage','ride_hailing','car_hire','moving_relocation','freight_forwarding','courier_express','tricycle_keke') THEN 'logistics'
      WHEN NEW.industry ILIKE '%financ%' OR NEW.industry ILIKE '%accounting%' OR NEW.industry IN ('accounting_bookkeeping','tax_consulting','insurance_agency','business_consulting','hr_consulting','legal_services','immigration_consulting','microfinance','investment_advisory') THEN 'finance_professional'
      WHEN NEW.industry ILIKE '%retail%' OR NEW.industry ILIKE '%ecommerce%' OR NEW.industry IN ('online_store_general','phones_electronics','supermarket_minimart','baby_children_store','home_appliances_store','building_materials','auto_spare_parts','books_stationery','gifts_crafts_souvenirs','sports_equipment') THEN 'retail'
      WHEN NEW.industry ILIKE '%event%' OR NEW.industry ILIKE '%wedding%' OR NEW.industry ILIKE '%hotel%' OR NEW.industry IN ('event_planning','wedding_planning','venue_rental','dj_entertainment','event_decor','hotel_guesthouse','travel_tourism','bar_lounge_club') THEN 'events_hospitality'
      WHEN NEW.industry ILIKE '%farm%' OR NEW.industry ILIKE '%agric%' OR NEW.industry ILIKE '%poultry%' OR NEW.industry ILIKE '%fish%' OR NEW.industry IN ('crop_farming','poultry_farming','fish_farming','cattle_livestock','agro_processing','organic_farming','farm_input_supply','horticulture') THEN 'agriculture'
      WHEN NEW.industry ILIKE '%media%' OR NEW.industry ILIKE '%music%' OR NEW.industry ILIKE '%content%' OR NEW.industry IN ('music_production','acting_film','blogging_content','youtube_tiktok_creator','printing_branding','animation_motion','pr_publicity','podcast_radio','influencer_creator') THEN 'media_content'
      WHEN NEW.industry IN ('auto_mechanic','car_wash','car_dealership','auto_body_paint','tyre_vulcanizing','auto_electrical') THEN 'auto'
      WHEN NEW.industry IN ('cleaning_services','laundry_drycleaning','home_security_cctv','domestic_staffing','elderly_care','waste_recycling') THEN 'home_services'
      WHEN NEW.industry IN ('ngo_foundation','church_religious','community_development') THEN 'ngo_religious'
      ELSE 'other'
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Trigger to auto-set category on profile save
DROP TRIGGER IF EXISTS trg_set_industry_category ON profiles;
CREATE TRIGGER trg_set_industry_category
  BEFORE INSERT OR UPDATE OF industry ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_industry_category();

-- VERIFICATION QUERY (run after migration):
-- SELECT industry, industry_category, COUNT(*) FROM profiles
-- WHERE industry IS NOT NULL
-- GROUP BY industry, industry_category
-- ORDER BY COUNT(*) DESC;
