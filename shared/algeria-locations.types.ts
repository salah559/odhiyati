export interface AlgeriaLocation {
  id: number;
  commune_name_ascii: string;
  commune_name: string;
  daira_name_ascii: string;
  daira_name: string;
  wilaya_code: string;
  wilaya_name_ascii: string;
  wilaya_name: string;
}

export interface Wilaya {
  code: string;
  name: string;
  nameAscii: string;
}

export interface Commune {
  id: number;
  name: string;
  nameAscii: string;
  wilayaCode: string;
}
