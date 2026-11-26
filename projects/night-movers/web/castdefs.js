// NIGHT MOVERS: the cast (all new, locked Ricks style via rick.js). Outfit objects + a card-draw helper.
export const C = {
  // the hero ("you"): salaryman, loosened red tie -> later hoodie + mustard beanie in the new city
  you:      { outfit: 'school', top: '#ffffff', tie: '#c0392b', pants: '#2c3550', hair: '#1f1a18', hairStyle: 'hair', shoes: '#2b1f1c' },
  youNew:   { outfit: 'hoodie', top: '#3f8f6f', print: '#f2c14e', hat: 'beanie', hatCol: '#e0a030', shoes: '#2b1f1c' },
  // the night movers (gloved crew) + the old driver
  driver:   { outfit: 'jumpsuit', top: '#24365a', hat: 'cap', hatCol: '#1b2540', moustache: '#9a958c', gloves: '#ffffff', patch: '#f2c14e' },
  mover2:   { outfit: 'jumpsuit', top: '#24365a', hat: 'cap', hatCol: '#1b2540', gloves: '#ffffff', patch: '#f2c14e' },
  mover3:   { outfit: 'jumpsuit', top: '#24365a', hat: 'cap', hatCol: '#1b2540', goatee: '#2a211d', gloves: '#ffffff', patch: '#f2c14e' },
  // the old life
  collector:{ outfit: 'suit', top: '#6b2f7e', shirt: '#1d1b22', tie: '#e5c158', hat: 'slick', glasses: 'aviator' },
  boss:     { outfit: 'suit', top: '#7a5a3a', tie: '#2f6fb5', hairStyle: 'bald', hair: '#d8d4cc', moustache: '#d8d4cc' },
  coworker: { outfit: 'school', top: '#e8f0ff', tie: '#2f6fb5', pants: '#3b3f52', hairStyle: 'bun', hair: '#3a2a22' },
  coworker2:{ outfit: 'school', top: '#fff6e6', tie: '#3f8f6f', pants: '#3b3f52', hairStyle: 'spiky', hair: '#2a211d', glasses: 'round' },
  mom:      { outfit: 'blouse', top: '#c96b84', skirt: '#4b5f8a', hairStyle: 'bun', hair: '#4a3d36' },
  momGrey:  { outfit: 'blouse', top: '#8a7fb8', skirt: '#4b5f8a', cardi: '#b9a88a', hairStyle: 'bun', hair: '#d9d6d0' },
  dad:      { outfit: 'cardigan', top: '#a5743c', shirt: '#e9e2d0', hairStyle: 'bald', hair: '#cfcac2', glasses: 'round', pants: '#5a4a3a' },
  neighbor: { outfit: 'pajamas', top: '#9fc6e8', towel: '#f2c14e', hairStyle: 'curly', hair: '#2a211d' },
  // the new life
  landlady: { outfit: 'apron', top: '#7fae5a', pants: '#5a4a3a', hat: 'perm', hair: '#c9c4bc', glasses: 'round' },
  foreman:  { outfit: 'vest', top: '#5c6b7a', hat: 'hardhat', hatCol: '#f5c02e', beard: '#3a2a22' },
  worker:   { outfit: 'vest', top: '#4f7fb8', hat: 'hardhat', hatCol: '#ffffff' },
  chef:     { outfit: 'chef', apron: '#2f4f8a', hat: 'hachimaki', hair: '#2a211d', moustache: '#2a211d' },
  diner:    { outfit: 'suit', top: '#3b5b3b', tie: '#c0392b', hairStyle: 'hair', hair: '#5a3b2a' },
  reporter: { outfit: 'suit', top: '#c0392b', shirt: '#ffffff', hairStyle: 'hair', hair: '#6b4226' },
  cop:      { outfit: 'police', hat: 'jpolice', pants: '#26304d' },
  // commuters / crowd extras
  extraA:   { outfit: 'suit', top: '#2b2f3d', tie: '#d9433a', hairStyle: 'hair', hair: '#1f1a18' },
  extraB:   { outfit: 'school', top: '#ffffff', tie: '#26304d', pants: '#26304d', hairStyle: 'pigtails', hair: '#3a2a22', backpack: '#c0392b' },
  extraC:   { outfit: 'trench', top: '#c09257', hat: 'fedora', hatCol: '#4a4450' },
  extraD:   { outfit: 'tee', top: '#e86a9a', pants: '#3b3f52', hairStyle: 'curly', hair: '#6b4226' },
  extraE:   { outfit: 'hoodie', top: '#6a5acd', hairStyle: 'spiky', hair: '#2a211d' },
};
// draw a character onto a card pen. o: rick() opts.  s: scale (1.22 = adult ~1.8 m incl. head)
export const drawChar = (rick, who, o = {}, s = 1.22) => (p) => { const g = p.g; g.save(); g.translate(300, 975); g.scale(s * (o.flipX ? -1 : 1), s); rick(g, C[who] ?? who, o); g.restore(); };
