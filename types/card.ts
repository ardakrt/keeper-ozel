// Unified Card type for web and mobile compatibility
// All cards are now stored using Basis Theory tokens

export type Card = {
  id: string;
  bt_token_id: string;
  user_id: string;
  label: string;
  holder_name_enc: string;
  cvc_enc: string; // Always "***" as it's stored in BT token
  exp_month_enc: string;
  exp_year_enc: string;
  last_four: string;
  masked_card_number?: string;
  card_brand: "visa" | "mastercard" | "troy" | "amex" | "unknown";
  created_at: string;
  updated_at: string;
};

// For display purposes, can be partial
export type CardDisplay = Partial<Card> & {
  id: string | number;
  bt_token_id: string;
};
