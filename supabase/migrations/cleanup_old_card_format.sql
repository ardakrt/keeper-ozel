-- Cleanup old card encryption format and keep only Basis Theory token format
-- This migration removes cards that don't have bt_token_id (old format)
-- and removes the card_number_enc column as we only use Basis Theory now

-- Delete cards that don't have a Basis Theory token (old format cards)
DELETE FROM cards WHERE bt_token_id IS NULL OR bt_token_id = '';

-- Drop the old card_number_enc column if it exists
ALTER TABLE cards DROP COLUMN IF EXISTS card_number_enc;

-- Make bt_token_id NOT NULL since all cards must have it now
ALTER TABLE cards ALTER COLUMN bt_token_id SET NOT NULL;

-- Make sure required columns are NOT NULL
ALTER TABLE cards ALTER COLUMN last_four SET NOT NULL;
ALTER TABLE cards ALTER COLUMN card_brand SET NOT NULL;

-- Add constraint to ensure last_four is exactly 4 digits
ALTER TABLE cards ADD CONSTRAINT check_last_four_format CHECK (last_four ~ '^\d{4}$');

-- Add constraint to ensure card_brand is valid
ALTER TABLE cards ADD CONSTRAINT check_card_brand_valid
  CHECK (card_brand IN ('visa', 'mastercard', 'troy', 'amex', 'unknown'));
