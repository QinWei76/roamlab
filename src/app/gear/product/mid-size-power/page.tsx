import Link from "next/link";
import styles from "./product.module.css";

const affiliateLinks = {
  ecoflow: "https://www.ecoflow.com/us/river-3-plus-portable-power-station",
  jackery:
    "https://www.jackery.com/products/jackery-explorer-300-plus-portable-power-station",
  bluetti: "https://www.bluettipower.com/",
};

const specs = [
  { label: "CAPACITY", value: "200–300Wh" },
  { label: "OUTPUT", value: "300–600W" },
  { label: "WEIGHT", value: "7.9–10.4 lb" },
  { label: "BEST FOR", value: "1–2 night trips" },
];

const pros = [
  "Easy to carry and store",
  "Ideal for phones, cameras and camp lighting",
  "Fits easily into smaller vehicles",
  "Simple entry point into portable power",
];

const cons = [
  "Limited runtime for high-draw appliances",
  "Not designed for extended off-grid systems",
];

const topPicks = [
  {
    badge: "BEST OVERALL",
    brand: "ECOFLOW",
    name: "RIVER 3 Plus",
    capacity: "286Wh",
    output: "600W",
