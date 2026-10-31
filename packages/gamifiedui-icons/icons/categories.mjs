/* Every icon belongs to exactly one category. Icons in the emoji and hk sets default to the
   "emoji" and "hong-kong" categories; everything else must be listed here (the build checks). */
export default [
  {
    id: 'interface', en: 'Interface', hant: '介面', hans: '界面',
    icons: [
      'pointer', 'check', 'close', 'plus', 'minus', 'chevron-right', 'chevron-left', 'chevron-down', 'chevron-up', 'menu',
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
  { id: 'files', en: 'Files', hant: '檔案', hans: '文件', icons: ['upload', 'download', 'file', 'pdf', 'pptx', 'docx', 'html', 'folder', 'archive'] },
  {
    id: 'stationery', en: 'Stationery and art', hant: '文具與美術', hans: '文具与美术',
    icons: ['book', 'notebook', 'paper', 'leaflet', 'contract', 'write', 'paint', 'drawing', 'pixel', 'scissors', 'clip', 'sticker'],
  },
  {
    id: 'communication', en: 'Communication', hant: '通訊', hans: '通讯',
    icons: ['mail', 'chat', 'phone', 'globe', 'bell', 'bell-ring', 'typing'],
  },
  {
    id: 'devices', en: 'Devices', hant: '裝置', hans: '设备',
    icons: ['mobile', 'tablet', 'drone', 'bot', 'remote', 'game-console', 'printer', 'laptop', 'desktop', 'mouse', 'mouse-pad', 'keyboard', 'earphone', 'charger'],
  },
  {
    id: 'shopping', en: 'Shopping', hant: '購物', hans: '购物',
    icons: ['cart', 'shop', 'money', 'money-bag', 'pouch', 'coin', 'coin-spin', 'credit-card'],
  },
  {
    id: 'equipment', en: 'Equipment', hant: '裝備', hans: '装备',
    icons: [
      'sword', 'shield', 'bow', 'axe', 'hammer', 'glove', 'helmet', 'armor', 'wand', 'spellbook', 'potion', 'key', 'backpack', 'rod',
      'stick', 'dig', 'cards',
    ],
  },
  {
    id: 'status', en: 'Stats and status', hant: '屬性與狀態', hans: '属性与状态',
    icons: ['heart', 'heartbeat', 'star', 'stamina', 'guts', 'mana', 'poison', 'medicine', 'dead', 'grave', 'bolt', 'fire', 'sparkle', 'sleep'],
  },
  {
    id: 'awards', en: 'Awards', hant: '獎勵', hans: '奖励',
    icons: ['trophy', 'award', 'medal-gold', 'medal-silver', 'medal-bronze', 'diamond', 'gift', 'balloon', 'kite', 'christmas-tree'],
  },
  { id: 'creatures', en: 'Creatures', hant: '生物', hans: '生物', icons: ['dog', 'cat', 'horse', 'cow', 'pig', 'sheep', 'chick', 'fish', 'shark', 'ghost', 'slime', 'goblin', 'zombie', 'dinosaur', 'monster', 'boss', 'wing', 'angel'] },
  { id: 'food', en: 'Food and drink', hant: '飲食', hans: '饮食', icons: [
      'bread', 'sandwich', 'food', 'meat', 'vegetable', 'bowl', 'drink', 'coffee', 'tea', 'alcohol', 'bottle', 'mug', 'cup',
      'glass',
    ],
  },
  {
    id: 'living', en: 'Home', hant: '家居', hans: '家居',
    icons: ['door', 'door-open', 'window', 'bedroom', 'armchair', 'chair', 'drawer', 'desk', 'bathtub', 'shower', 'bulb', 'soap', 'toothbrush'],
  },
  { id: 'clothing', en: 'Clothing', hant: '服飾', hans: '服饰', icons: ['hat', 'shirt', 'shorts', 'dress', 'gown', 'suit', 'slippers'] },
  {
    id: 'people', en: 'People', hant: '人物', hans: '人物',
    icons: ['male', 'female', 'boy', 'girl', 'student', 'teacher', 'doctor', 'nurse', 'chef', 'blacksmith', 'police', 'soldier', 'pirate', 'king', 'queen', 'prince', 'princess'],
  },
  {
    id: 'classes', en: 'Classes and magic', hant: '職業與魔法', hans: '职业与魔法',
    icons: ['fighter', 'warrior', 'knight', 'paladin', 'archer', 'thief', 'ninja', 'bard', 'monk', 'wizard', 'priest', 'necromancer', 'black-magic', 'white-magic', 'cure', 'cross', 'god'],
  },
  { id: 'places', en: 'Places', hant: '地點', hans: '地点', icons: ['building', 'map', 'bank', 'convenience-store', 'market', 'drugstore', 'gas-station', 'crosswalk', 'bridge', 'park', 'fountain', 'library', 'hospital', 'clinic', 'police-station', 'fire-station', 'post-office', 'court', 'hotel', 'inn', 'restaurant', 'bar', 'cave', 'dungeon', 'castle', 'guild', 'stairs-up', 'stairs-down'] },
  { id: 'sports', en: 'Sports and activities', hant: '運動與活動', hans: '运动与活动', icons: ['walking', 'running', 'hiking', 'swimming', 'swimming-pool', 'badminton', 'basketball', 'football', 'ball'] },
  { id: 'flags', en: 'Flags', hant: '旗幟', hans: '旗帜', icons: ['flag-hk', 'flag-cn', 'flag-jp', 'flag-kr', 'flag-us', 'flag-uk'] },
  { id: 'transport', en: 'Transport', hant: '交通', hans: '交通', icons: ['car', 'bus', 'train', 'airplane', 'bicycle', 'skateboard', 'scooter', 'roller-skate', 'boat', 'ship'] },
  { id: 'school', en: 'School', hant: '學校', hans: '学校', icons: ['university', 'homework', 'classroom', 'lecture', 'blackboard', 'chalk', 'pointer-stick'] },
  { id: 'weather', en: 'Weather', hant: '天氣', hans: '天气', icons: ['sun', 'cloudy', 'cloud', 'rain', 'thunderstorm', 'snow', 'wind', 'umbrella', 'moon'] },
  {
    id: 'nature', en: 'Nature and materials', hant: '自然與材料', hans: '自然与材料',
    icons: ['smoke', 'water', 'sea', 'sand', 'mountain', 'solar-panel', 'plant', 'tree', 'flowers', 'herbs', 'wood', 'metal'],
  },
  { id: 'emoji', en: 'Emoji and reactions', hant: '表情與反應', hans: '表情与反应', icons: ['thumb-up', 'thumb-down', 'fist', 'fingers-crossed'] },
  { id: 'hong-kong', en: 'Hong Kong', hant: '香港', hans: '香港', icons: [] },
];
