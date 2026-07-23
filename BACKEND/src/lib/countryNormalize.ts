export function normalizeCountry(location: string | null | undefined): string | null {
  if (!location || !location.trim()) return null;

  // Split by comma and get the last segment
  const parts = location.split(",");
  let countryPart = parts[parts.length - 1].trim().toLowerCase();

  // Remove common punctuation/symbols if any
  countryPart = countryPart.replace(/[^a-z\s]/g, "").trim();

  if (!countryPart) return null;

  const countryMap: Record<string, string> = {
    "us": "United States",
    "usa": "United States",
    "u s a": "United States",
    "united states": "United States",
    "united states of america": "United States",
    "uk": "United Kingdom",
    "u k": "United Kingdom",
    "united kingdom": "United Kingdom",
    "great britain": "United Kingdom",
    "england": "United Kingdom",
    "uae": "United Arab Emirates",
    "u a e": "United Arab Emirates",
    "united arab emirates": "United Arab Emirates",
    "egypt": "Egypt",
    "ksa": "Saudi Arabia",
    "saudi arabia": "Saudi Arabia",
    "saudi": "Saudi Arabia",
    "canada": "Canada",
    "australia": "Australia",
    "germany": "Germany",
    "france": "France",
    "italy": "Italy",
    "spain": "Spain",
    "netherlands": "Netherlands",
    "brazil": "Brazil",
    "india": "India",
    "china": "China",
    "japan": "Japan",
    "south korea": "South Korea",
    "korea": "South Korea",
    // Add more common countries as needed
  };

  // Ambiguous terms
  const ambiguous = ["remote", "worldwide", "various", "anywhere", "global", "online"];
  if (ambiguous.includes(countryPart)) {
    return null;
  }

  // Exact match from map, or fallback to Capitalized version of the extracted string
  if (countryMap[countryPart]) {
    return countryMap[countryPart];
  }

  // Capitalize each word for unknown countries
  const capitalized = countryPart.replace(/\b\w/g, char => char.toUpperCase());
  return capitalized;
}

export function countDistinctCountries(locations: (string | null | undefined)[]): number {
  const distinct = new Set<string>();
  for (const loc of locations) {
    const normalized = normalizeCountry(loc);
    if (normalized) {
      distinct.add(normalized);
    }
  }
  return distinct.size;
}
