// Mirrors the backend rule: each country runs independently. Admins and
// members with no country assignment work everywhere; everyone else works only
// in the countries they are assigned to.
export interface CountryScopedMember {
  role?: string;
  countryIds?: string[];
}

export const worksIn = (m: CountryScopedMember, countryId: string) =>
  m.role === "admin" || !m.countryIds?.length || m.countryIds.includes(countryId);

// Members who can be assigned work in a country. "all" (or no country yet)
// needs someone who works in every country.
export const membersForCountry = <T extends CountryScopedMember>(
  members: T[],
  countryId: string | null | undefined,
): T[] => {
  if (!countryId) return members;
  if (countryId === "all")
    return members.filter((m) => m.role === "admin" || !m.countryIds?.length);
  return members.filter((m) => worksIn(m, countryId));
};
