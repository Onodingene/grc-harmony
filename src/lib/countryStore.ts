import { create } from "zustand";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface CountryStore {
  countries: Country[];
  selectedCountry: Country | null;
  setCountries: (c: Country[]) => void;
  setSelectedCountry: (c: Country | null) => void;
}

export const useCountryStore = create<CountryStore>((set) => ({
  countries: [],
  selectedCountry: null,
  setCountries: (countries) => set({ countries }),
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
}));
