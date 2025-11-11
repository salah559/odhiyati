import locationsData from './algeria-locations.json';
import type { AlgeriaLocation, Wilaya, Commune } from './algeria-locations.types';

const locations = locationsData as AlgeriaLocation[];

export function getWilayas(): Wilaya[] {
  const wilayaMap = new Map<string, Wilaya>();
  
  locations.forEach(location => {
    if (!wilayaMap.has(location.wilaya_code)) {
      wilayaMap.set(location.wilaya_code, {
        code: location.wilaya_code,
        name: location.wilaya_name,
        nameAscii: location.wilaya_name_ascii,
      });
    }
  });
  
  return Array.from(wilayaMap.values()).sort((a, b) => 
    parseInt(a.code) - parseInt(b.code)
  );
}

export function getCommunesByWilaya(wilayaCode: string): Commune[] {
  return locations
    .filter(location => location.wilaya_code === wilayaCode)
    .map(location => ({
      id: location.id,
      name: location.commune_name,
      nameAscii: location.commune_name_ascii,
      wilayaCode: location.wilaya_code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

export function getCommuneById(id: number): Commune | undefined {
  const location = locations.find(loc => loc.id === id);
  if (!location) return undefined;
  
  return {
    id: location.id,
    name: location.commune_name,
    nameAscii: location.commune_name_ascii,
    wilayaCode: location.wilaya_code,
  };
}

export function getWilayaByCode(code: string): Wilaya | undefined {
  const location = locations.find(loc => loc.wilaya_code === code);
  if (!location) return undefined;
  
  return {
    code: location.wilaya_code,
    name: location.wilaya_name,
    nameAscii: location.wilaya_name_ascii,
  };
}
