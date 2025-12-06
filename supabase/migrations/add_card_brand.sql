-- Add card_brand column to cards table
-- This column stores the detected card brand: visa, mastercard, troy, amex, or unknown
ALTER TABLE cards ADD COLUMN IF NOT EXISTS card_brand TEXT DEFAULT 'unknown';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_cards_card_brand ON cards(card_brand);

-- Update existing cards to have 'unknown' brand if they don't have one
UPDATE cards SET card_brand = 'unknown' WHERE card_brand IS NULL;
