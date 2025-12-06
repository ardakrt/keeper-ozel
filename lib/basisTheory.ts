import { BasisTheory } from "@basis-theory/basis-theory-js";

let instance: any | null = null;

export default async function getBasisTheory() {
  if (instance) return instance;
  const apiKey = process.env.BASIS_THEORY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing BASIS_THEORY_API_KEY environment variable");
  }
  instance = await new BasisTheory().init(apiKey);
  return instance;
}
