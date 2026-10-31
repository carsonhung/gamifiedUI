/* Every icon belongs to exactly one category. Icons in the emoji and hk sets default to the
   "emoji" and "hong-kong" categories; everything else must be listed here (the build checks). */
export default [
  {
    id: 'interface', en: 'Interface', hant: '介面', hans: '界面',
    icons: [
      'check', 'close', 'plus', 'minus', 'chevron-right', 'chevron-left', 'chevron-down', 'chevron-up', 'menu',
      'search', 'home', 'gear', 'user', 'lock', 'info', 'warning', 'reload', 'arrow-right', 'arrow-left',
      'arrow-down', 'arrow-up', 'edit', 'copy', 'link', 'share', 'eye', 'filter', 'logout', 'pin', 'flag',
      'bookmark', 'zoom-in', 'zoom-out', 'create', 'trash', 'calendar', 'hourglass', 'clock', 'loading',
    ],
  },
  {
    id: 'media', en: 'Media', hant: '媒體', hans: '媒体',
    icons: [
      'play', 'pause', 'stop', 'go', 'sound', 'mute', 'volume-up', 'volume-down', 'music', 'camera', 'image',
      'photos', 'microphone', 'speaker', 'sing',
    ],
  },
  { id: 'files', en: 'Files', hant: '檔案', hans: '文件', icons: ['upload', 'download', 'file', 'folder', 'archive'] },
  {
    id: 'stationery', en: 'Stationery and art', hant: '文具與美術', hans: '文具与美术',
    icons: ['book', 'notebook', 'paper', 'write', 'paint', 'drawing', 'pixel', 'scissors', 'clip', 'sticker'],
  },
  {
    id: 'communication', en: 'Communication', hant: '通訊', hans: '通讯',
    icons: ['mail', 'chat', 'phone', 'globe', 'bell', 'bell-ring', 'typing'],
  },
  {
    id: 'devices', en: 'Devices', hant: '裝置', hans: '设备',
    icons: ['mobile', 'tablet', 'laptop', 'desktop', 'mouse', 'mouse-pad', 'keyboard', 'earphone', 'charger'],
  },
  {
    id: 'shopping', en: 'Shopping', hant: '購物', hans: '购物',
    icons: ['cart', 'shop', 'money', 'money-bag', 'pouch', 'coin', 'coin-spin', 'credit-card'],
  },
  {
    id: 'equipment', en: 'Equipment', hant: '裝備', hans: '装备',
    icons: [
      'sword', 'shield', 'bow', 'axe', 'hammer', 'helmet', 'armor', 'wand', 'spellbook', 'potion', 'key', 'backpack', 'rod',
      'stick', 'dig', 'cards',
    ],
  },
  {
    id: 'status', en: 'Stats and status', hant: '屬性與狀態', hans: '属性与状态',
    icons: ['heart', 'heartbeat', 'star', 'stamina', 'guts', 'mana', 'poison', 'medicine', 'dead', 'bolt', 'fire', 'sparkle', 'sleep'],
  },
  {
    id: 'awards', en: 'Awards', hant: '獎勵', hans: '奖励',
    icons: ['trophy', 'award', 'medal-gold', 'medal-silver', 'medal-bronze', 'diamond', 'gift', 'christmas-tree'],
  },
  { id: 'creatures', en: 'Creatures', hant: '生物', hans: '生物', icons: ['dog', 'cat', 'horse', 'cow', 'pig', 'sheep', 'chick', 'fish', 'shark', 'ghost', 'slime', 'goblin', 'boss'] },
  { id: 'food', en: 'Food and drink', hant: '飲食', hans: '饮食', icons: [
      'bread', 'sandwich', 'food', 'meat', 'vegetable', 'bowl', 'drink', 'coffee', 'tea', 'alcohol', 'bottle', 'mug',
      'glass',
    ],
  },
  {
    id: 'living', en: 'Home', hant: '家居', hans: '家居',
    icons: ['window', 'bedroom', 'armchair', 'chair', 'drawer', 'desk', 'bathtub', 'shower', 'bulb', 'soap', 'toothbrush', 'dress'],
  },
  {
    id: 'people', en: 'People', hant: '人物', hans: '人物',
    icons: ['male', 'female', 'boy', 'girl', 'student', 'teacher', 'police', 'soldier', 'king', 'queen', 'prince', 'princess'],
  },
  { id: 'places', en: 'Places', hant: '地點', hans: '地点', icons: ['building', 'map', 'hotel', 'inn', 'restaurant', 'bar', 'cave', 'dungeon', 'castle', 'guild', 'stairs-up', 'stairs-down'] },
  { id: 'transport', en: 'Transport', hant: '交通', hans: '交通', icons: ['car', 'bicycle', 'scooter', 'roller-skate', 'ship'] },
  { id: 'school', en: 'School', hant: '學校', hans: '学校', icons: ['classroom', 'lecture', 'blackboard'] },
  {
    id: 'nature', en: 'Nature and materials', hant: '自然與材料', hans: '自然与材料',
    icons: ['sun', 'moon', 'cloud', 'smoke', 'water', 'sea', 'sand', 'solar-panel', 'tree', 'flowers', 'herbs', 'wood', 'metal'],
  },
  { id: 'emoji', en: 'Emoji and reactions', hant: '表情與反應', hans: '表情与反应', icons: ['thumb-up', 'thumb-down', 'fist', 'fingers-crossed'] },
  { id: 'hong-kong', en: 'Hong Kong', hant: '香港', hans: '香港', icons: [] },
];
