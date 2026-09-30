// Mirrors the backend rule: each country runs independently. Admins work in
// every country; everyone else works only in the countries they are assigned
// to. A non-admin with no assignment belongs to no country yet.
export interface CountryScopedMember {
  role?: string;
  countryIds?: string[];
}

export const worksIn = (m: CountryScopedMember, countryId: string) =>
  m.role === "admin" || !!m.countryIds?.includes(countryId);

export const isUnassigned = (m: CountryScopedMember) =>
  m.role !== "admin" && !m.countryIds?.length;

// Members who can be assigned work in a country. Until a country is chosen,
// nobody is offered, so people from one country never leak into another.
export const membersForCountry = <T extends CountryScopedMember>(
  members: T[],
  countryId: string | null | undefined,
): T[] => {
  if (!countryId) return [];
  if (countryId === "all") return members.filter((m) => m.role === "admin");
  return members.filter((m) => worksIn(m, countryId));
};
