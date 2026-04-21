export async function runOcr(file) {
  if (!file) {
    return "";
  }

  return [
    "BANANA 1.99",
    "SPINACH 2.49",
    "MILK 2% 4.79",
    "STRAWBERRY 1LB 5.49",
    "TOTAL 14.76"
  ].join("\n");
}
