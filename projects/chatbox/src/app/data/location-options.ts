export interface CountryCities {
  country: string;
  code: string;
  cities: string[];
}

export const COUNTRY_CITY_OPTIONS: CountryCities[] = [
  { country: 'Morocco', code: 'MAR', cities: ['Casablanca', 'Rabat', 'Tangier', 'Fez', 'Marrakech', 'Agadir', 'Meknes', 'Oujda', 'Tetouan', 'Kenitra', 'Safi', 'El Jadida', 'Beni Mellal', 'Nador', 'Taza', 'Settat', 'Khouribga', 'Larache', 'Khemisset', 'Guelmim', 'Errachidia', 'Ouarzazate', 'Azrou', 'Ifrane', 'Essaouira', 'Al Hoceima', 'Other'] },
  { country: 'France', code: 'FRA', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Grenoble', 'Dijon', 'Other'] },
  { country: 'Spain', code: 'ESP', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga', 'Murcia', 'Bilbao', 'Alicante', 'Granada', 'Other'] },
  { country: 'United States', code: 'USA', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'San Francisco', 'Seattle', 'Boston', 'Miami', 'Other'] },
  { country: 'Canada', code: 'CAN', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City', 'Winnipeg', 'Halifax', 'Other'] },
  { country: 'United Kingdom', code: 'GBR', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Edinburgh', 'Cardiff', 'Other'] },
  { country: 'Germany', code: 'DEU', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dusseldorf', 'Leipzig', 'Dortmund', 'Other'] },
  { country: 'Italy', code: 'ITA', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice', 'Other'] },
  { country: 'Netherlands', code: 'NLD', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Other'] },
  { country: 'Belgium', code: 'BEL', cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liege', 'Bruges', 'Leuven', 'Other'] },
  { country: 'Switzerland', code: 'CHE', cities: ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'Other'] },
  { country: 'Portugal', code: 'PRT', cities: ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Aveiro', 'Funchal', 'Other'] },
  { country: 'Turkey', code: 'TUR', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Other'] },
  { country: 'United Arab Emirates', code: 'ARE', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Other'] },
  { country: 'Saudi Arabia', code: 'SAU', cities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Tabuk', 'Other'] },
  { country: 'Qatar', code: 'QAT', cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Lusail', 'Umm Salal', 'Other'] },
  { country: 'Egypt', code: 'EGY', cities: ['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta', 'Aswan', 'Luxor', 'Other'] },
  { country: 'Tunisia', code: 'TUN', cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabes', 'Nabeul', 'Other'] },
  { country: 'Algeria', code: 'DZA', cities: ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif', 'Tlemcen', 'Other'] },
  { country: 'Senegal', code: 'SEN', cities: ['Dakar', 'Thies', 'Saint-Louis', 'Touba', 'Kaolack', 'Ziguinchor', 'Other'] },
  { country: 'Ivory Coast', code: 'CIV', cities: ['Abidjan', 'Yamoussoukro', 'Bouake', 'San Pedro', 'Daloa', 'Korhogo', 'Other'] },
  { country: 'Nigeria', code: 'NGA', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Kaduna', 'Other'] },
  { country: 'South Africa', code: 'ZAF', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Other'] },
  { country: 'Kenya', code: 'KEN', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Other'] },
  { country: 'India', code: 'IND', cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata', 'Other'] },
  { country: 'China', code: 'CHN', cities: ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Hangzhou', 'Chengdu', 'Wuhan', 'Other'] },
  { country: 'Japan', code: 'JPN', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Kyoto', 'Fukuoka', 'Sapporo', 'Other'] },
  { country: 'South Korea', code: 'KOR', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Other'] },
  { country: 'Brazil', code: 'BRA', cities: ['Sao Paulo', 'Rio de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Curitiba', 'Other'] },
  { country: 'Mexico', code: 'MEX', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Merida', 'Other'] },
  { country: 'Other', code: '', cities: ['Other'] }
];

export const SECTOR_OPTIONS = [
  'SaaS / Software',
  'Artificial Intelligence',
  'E-commerce',
  'Marketplace',
  'Education / EdTech',
  'Health / MedTech',
  'FinTech',
  'Agriculture / AgriTech',
  'Food & Beverage',
  'Tourism / Travel',
  'Logistics / Delivery',
  'Transportation',
  'Real Estate / PropTech',
  'Retail',
  'Fashion / Beauty',
  'Energy / CleanTech',
  'Environment / Recycling',
  'Manufacturing',
  'Construction',
  'Cybersecurity',
  'LegalTech',
  'HR / Recruitment',
  'Marketing / Advertising',
  'Media / Content',
  'Gaming',
  'Sports / Fitness',
  'Social Impact',
  'Non-profit / Association',
  'Consulting',
  'Local Services',
  'Handmade / Crafts',
  'Other'
];

export function countryCodeFor(country: string): string {
  return COUNTRY_CITY_OPTIONS.find(item => item.country === country)?.code || '';
}
