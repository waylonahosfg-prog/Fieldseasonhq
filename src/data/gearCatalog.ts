export interface GearProduct {
  id: string;
  name: string;
  category: string;
  whyUseful: string;
  url: string;
  verifiedOn: string;
  matchSpecies?: string[];
  matchStates?: string[];
  priority: number;
}

const TAG = 'fieldseasonhq-20';
const amazonSearch = (keywords: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(keywords)}&tag=${TAG}`;

export const GEAR_CATALOG: GearProduct[] = [
  {
    id: 'blaze-orange-vest-hat',
    name: 'Vortex Blaze Orange Vest and Hat Combo',
    category: 'Firearm Visibility',
    whyUseful: 'High-visibility hunter orange kit for firearm deer, elk, and upland seasons where minimum square-inch coverage rules apply.',
    url: `https://www.amazon.com/dp/B0DW3MXC12?tag=${TAG}`,
    verifiedOn: '2026-11-03',
    matchSpecies: ['deer', 'elk', 'antelope', 'bear', 'pheasant', 'quail', 'grouse', 'rabbit', 'squirrel'],
    priority: 1
  },
  {
    id: 'waterproof-tag-holder',
    name: 'Waterproof Hunting License & Tag Holders with Zip Ties',
    category: 'Tagging & Compliance',
    whyUseful: 'Keeps paper carcass tags dry and legible in rain, snow, or brush when state law requires attaching tags immediately after harvest.',
    url: amazonSearch('waterproof hunting tag holder with zip ties'),
    verifiedOn: '2026-11-22',
    matchSpecies: ['deer', 'elk', 'turkey', 'bear', 'antelope', 'javelina'],
    priority: 2
  },
  {
    id: 'quartering-game-bags',
    name: 'Breathable Backcountry Meat & Quartering Game Bags',
    category: 'Field Care',
    whyUseful: 'Protects boned-out meat or quarters from insects and debris while allowing airflow to cool meat quickly in the field.',
    url: amazonSearch('breathable elk deer quartering game bags'),
    verifiedOn: '2026-11-22',
    matchSpecies: ['elk', 'mule deer', 'moose', 'bear', 'antelope', 'deer'],
    priority: 3
  },
  {
    id: 'archery-rangefinder',
    name: 'Angle-Compensating Hunting Laser Rangefinder',
    category: 'Archery & Rifle Optics',
    whyUseful: 'Calculates true horizontal shoot-to distance on steep terrain and timber edges for clean archery and rifle shot placement.',
    url: amazonSearch('hunting laser rangefinder angle compensation'),
    verifiedOn: '2026-11-22',
    matchSpecies: ['deer', 'elk', 'antelope', 'turkey', 'bear'],
    priority: 4
  },
  {
    id: 'binocular-chest-harness',
    name: 'Quiet Enclosed Binocular Chest Harness',
    category: 'Optics Carry',
    whyUseful: 'Keeps glass dust-free, quiet against brush, and accessible one-handed during dawn and dusk glassing sessions.',
    url: amazonSearch('enclosed hunting binocular chest harness'),
    verifiedOn: '2026-11-22',
    matchSpecies: ['elk', 'deer', 'antelope', 'turkey', 'coyote'],
    priority: 5
  },
  {
    id: 'replaceable-blade-knife',
    name: 'Replaceable-Blade Field Dressing & Skinning Knife',
    category: 'Field Dressing',
    whyUseful: 'Surgical-sharp drop-point blades swap out in seconds so you never lose time sharpening mid-cape or quartering.',
    url: amazonSearch('replaceable blade hunting field dressing knife'),
    verifiedOn: '2026-11-22',
    matchSpecies: ['deer', 'elk', 'bear', 'hog', 'javelina', 'antelope'],
    priority: 6
  },
  {
    id: 'waterfowl-dry-bag',
    name: 'Waterproof Blind Bag & Non-Toxic Shot Shell Case',
    category: 'Waterfowl & Dove',
    whyUseful: 'Keeps shells, calls, and paper stamps dry in flooded timber, marsh blinds, or wet boat decks.',
    url: amazonSearch('waterproof waterfowl hunting blind bag'),
    verifiedOn: '2026-11-22',
    matchSpecies: ['duck', 'goose', 'waterfowl', 'dove', 'teal', 'rail', 'snipe'],
    priority: 7
  },
  {
    id: 'red-green-headlamp',
    name: 'Rechargeable Headlamp with Red & Green Low-Light Modes',
    category: 'Pre-Dawn Navigation',
    whyUseful: 'Preserves night vision and avoids spooking game while walking into stands or blinds before legal shooting light.',
    url: amazonSearch('hunting headlamp red green light rechargeable'),
    verifiedOn: '2026-11-22',
    matchSpecies: ['deer', 'turkey', 'duck', 'elk', 'bear'],
    priority: 8
  }
];

export function getGearForState(state: { slug: string; seasonFacts?: Array<{ species: string }>; gear?: any[] }): GearProduct[] {
  const speciesList = (state.seasonFacts || []).map((f) => f.species.toLowerCase());
  const matched = GEAR_CATALOG.filter((item) => {
    if (item.matchStates?.includes(state.slug)) return true;
    if (!item.matchSpecies) return true;
    return item.matchSpecies.some((kw) => speciesList.some((sp) => sp.includes(kw)));
  });

  return matched.sort((a, b) => a.priority - b.priority).slice(0, 6);
}
