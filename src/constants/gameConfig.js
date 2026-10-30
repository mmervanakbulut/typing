export const LETTER_MODES = {
  homeRow: {
    id: 'homeRow',
    title: 'Temel Sıra (Başlangıç)',
    subtitle: 'A S D F G H J K L Ş İ',
    description: 'On parmak klavyenin merkez sırasındaki harfler.',
    letters: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    badge: '1. Aşama'
  },
  topRow: {
    id: 'topRow',
    title: 'Üst Sıra Harfleri',
    subtitle: 'Q W E R T Y U I O P Ğ Ü',
    description: 'Klavyenin üst sırasındaki harfleri pekiştirir.',
    letters: ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    badge: '2. Aşama'
  },
  bottomRow: {
    id: 'bottomRow',
    title: 'Alt Sıra Harfleri',
    subtitle: 'Z X C V B N M Ö Ç',
    description: 'Klavyenin alt sırasındaki harflere odaklanır.',
    letters: ['Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'],
    badge: '3. Aşama'
  },
  allTurkish: {
    id: 'allTurkish',
    title: 'Tüm Harfler (Karışık)',
    subtitle: 'A - Z ve Türkçe Karakterler',
    description: 'Alfabedeki tüm harflerle tam saha balık avı!',
    letters: [
      'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
      'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
      'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
    ],
    badge: 'Tam Mod'
  }
};

export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: 'Kolay',
    desc: 'Yavaş düşüş, 5 can',
    baseSpeed: 62,       // pixels per second
    speedPerLevel: 14,   // ~15-20% hissedilir hız artışı
    spawnInterval: 2050, // ms
    minSpawnInterval: 900,
    maxActiveFish: 4,
    lives: 5,
    fishPerLevel: 12
  },
  medium: {
    id: 'medium',
    label: 'Orta',
    desc: 'Normal hız, 4 can',
    baseSpeed: 92,
    speedPerLevel: 18,
    spawnInterval: 1550,
    minSpawnInterval: 700,
    maxActiveFish: 6,
    lives: 4,
    fishPerLevel: 15
  },
  hard: {
    id: 'hard',
    label: 'Zor',
    desc: 'Hızlı şelale, 3 can',
    baseSpeed: 128,
    speedPerLevel: 24,
    spawnInterval: 1150,
    minSpawnInterval: 520,
    maxActiveFish: 8,
    lives: 3,
    fishPerLevel: 20
  }
};

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç']
];

export const HOME_ROW_ANCHORS = ['F', 'J'];

export const FISH_PALETTES = [
  { body: '#FF6B6B', fin: '#EE5253', belly: '#FFC8C8' }, // Mercan Kırmızı
  { body: '#FF9F43', fin: '#E67E22', belly: '#FFEAA7' }, // Turuncu
  { body: '#54A0FF', fin: '#2E86DE', belly: '#C8E6FF' }, // Okyanus Mavisi
  { body: '#1DD1A1', fin: '#10AC84', belly: '#BFF7E6' }, // Turkuaz Yeşil
  { body: '#A29BFE', fin: '#6C5CE7', belly: '#E6E2FF' }, // Mor
  { body: '#FD79A8', fin: '#E84393', belly: '#FFD6E7' }  // Pembe
];

/**
 * Normalizes a pressed keyboard key to Turkish uppercase character.
 * Ensures 'i' -> 'İ' and 'ı' -> 'I' consistently across browsers/OS.
 */
export function normalizeTurkishKey(rawKey) {
  if (!rawKey || rawKey.length !== 1) return '';
  const map = {
    'i': 'İ',
    'İ': 'İ',
    'ı': 'I',
    'I': 'I',
    'ğ': 'Ğ',
    'Ğ': 'Ğ',
    'ü': 'Ü',
    'Ü': 'Ü',
    'ş': 'Ş',
    'Ş': 'Ş',
    'ö': 'Ö',
    'Ö': 'Ö',
    'ç': 'Ç',
    'Ç': 'Ç'
  };
  if (map[rawKey]) return map[rawKey];
  return rawKey.toLocaleUpperCase('tr-TR');
}

