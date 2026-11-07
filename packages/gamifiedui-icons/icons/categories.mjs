/* Every icon belongs to exactly one category, and every category to one group. Icons in the
   emoji and hk sets default to the "emoji" and "hong-kong" categories; everything else must be
   listed here (the build checks). Groups and categories are shown in this order. */
export const groups = [
  { id: 'interface', en: 'Interface', hant: '介面', hans: '界面' },
  { id: 'game', en: 'Game', hant: '遊戲', hans: '游戏' },
  { id: 'world', en: 'World and places', hant: '世界與地點', hans: '世界与地点' },
  { id: 'life', en: 'People and daily life', hant: '人物與生活', hans: '人物与生活' },
  { id: 'culture', en: 'Culture and expression', hant: '文化與表達', hans: '文化与表达' },
];

export default [
  {
    id: 'navigation', group: 'interface', en: 'Navigation and arrows', hant: '導覽與箭頭', hans: '导航与箭头',
    icons: [
      'pointer', 'menu', 'home', 'search', 'zoom-in', 'zoom-out', 'link', 'pin', 'logout', 'chevron-right', 'chevron-left',
      'chevron-down', 'chevron-up', 'arrow-right', 'arrow-left', 'arrow-down', 'arrow-up',
    ],
  },
  {
    id: 'actions', group: 'interface', en: 'Actions', hant: '操作', hans: '操作',
    icons: [
      'check', 'close', 'plus', 'minus', 'create', 'edit', 'copy', 'share', 'trash', 'filter', 'reload', 'bookmark',
      'flag', 'eye', 'gear', 'user', 'lock',
    ],
  },
  {
    id: 'alerts-time', group: 'interface', en: 'Alerts and time', hant: '提示與時間', hans: '提示与时间',
    icons: ['info', 'warning', 'loading', 'calendar', 'clock', 'hourglass'],
  },
  {
    id: 'media', group: 'interface', en: 'Media', hant: '媒體', hans: '媒体',
    icons: [
      'play', 'pause', 'fast-forward', 'stop', 'go', 'sound', 'mute', 'volume-up', 'volume-down', 'music', 'camera', 'image',
      'photos', 'microphone', 'speaker', 'sing',
    ],
  },
  {
    id: 'communication', group: 'interface', en: 'Communication', hant: '通訊', hans: '通讯',
    icons: ['mail', 'chat', 'phone', 'globe', 'bell', 'bell-ring', 'typing'],
  },
  {
    id: 'files', group: 'interface', en: 'Files', hant: '檔案', hans: '文件',
    icons: ['upload', 'download', 'file', 'pdf', 'pptx', 'docx', 'html', 'folder', 'archive'],
  },
  {
    id: 'devices', group: 'interface', en: 'Devices', hant: '裝置', hans: '设备',
    icons: ['mobile', 'tablet', 'drone', 'bot', 'remote', 'game-console', 'printer', 'laptop', 'desktop', 'mouse', 'mouse-pad', 'keyboard', 'earphone', 'charger'],
  },

  {
    id: 'status', group: 'game', en: 'Stats and status', hant: '屬性與狀態', hans: '属性与状态',
    icons: ['heart', 'heartbeat', 'star', 'stamina', 'guts', 'mana', 'poison', 'medicine', 'dead', 'grave', 'bolt', 'fire', 'sparkle', 'sleep'],
  },
  {
    id: 'equipment', group: 'game', en: 'Equipment', hant: '裝備', hans: '装备',
    icons: ['sword', 'shield', 'bow', 'glove', 'helmet', 'armor', 'wand', 'spellbook', 'potion', 'key', 'backpack', 'cards'],
  },
  {
    id: 'tools', group: 'game', en: 'Tools and gathering', hant: '工具與採集', hans: '工具与采集',
    icons: ['hammer', 'axe', 'rod', 'dig', 'stick'],
  },
  {
    id: 'classes', group: 'game', en: 'Classes and magic', hant: '職業與魔法', hans: '职业与魔法',
    icons: ['fighter', 'warrior', 'knight', 'paladin', 'archer', 'thief', 'ninja', 'bard', 'monk', 'wizard', 'priest', 'necromancer', 'black-magic', 'white-magic', 'cure', 'cross', 'god'],
  },
  {
    id: 'creatures', group: 'game', en: 'Creatures', hant: '生物', hans: '生物',
    icons: ['dog', 'cat', 'horse', 'cow', 'pig', 'sheep', 'chick', 'fish', 'shark', 'ghost', 'slime', 'goblin', 'zombie', 'dinosaur', 'monster', 'boss', 'wing', 'angel'],
  },
  {
    id: 'awards', group: 'game', en: 'Awards', hant: '獎勵', hans: '奖励',
    icons: ['trophy', 'award', 'medal-gold', 'medal-silver', 'medal-bronze', 'diamond'],
  },
  {
    id: 'shopping', group: 'game', en: 'Shopping and money', hant: '購物與金錢', hans: '购物与金钱',
    icons: ['cart', 'basket', 'shop', 'money', 'money-bag', 'pouch', 'coin', 'coin-spin', 'credit-card'],
  },

  {
    id: 'places', group: 'world', en: 'Places', hant: '地點', hans: '地点',
    icons: ['building', 'map', 'bank', 'convenience-store', 'market', 'drugstore', 'gas-station', 'crosswalk', 'bridge', 'park', 'fountain', 'library', 'hospital', 'clinic', 'police-station', 'fire-station', 'post-office', 'court', 'hotel', 'inn', 'restaurant', 'bar', 'cave', 'dungeon', 'castle', 'guild', 'stairs-up', 'stairs-down'],
  },
  {
    id: 'transport', group: 'world', en: 'Transport', hant: '交通', hans: '交通',
    icons: ['car', 'bus', 'train', 'airplane', 'bicycle', 'skateboard', 'scooter', 'roller-skate', 'boat', 'ship'],
  },
  {
    id: 'weather', group: 'world', en: 'Weather', hant: '天氣', hans: '天气',
    icons: ['sun', 'cloudy', 'cloud', 'rain', 'thunderstorm', 'snow', 'wind', 'umbrella', 'moon'],
  },
  {
    id: 'nature', group: 'world', en: 'Nature and materials', hant: '自然與材料', hans: '自然与材料',
    icons: ['smoke', 'water', 'sea', 'sand', 'mountain', 'solar-panel', 'plant', 'tree', 'flowers', 'herbs', 'wood', 'metal'],
  },

  {
    id: 'people', group: 'life', en: 'People', hant: '人物', hans: '人物',
    icons: ['male', 'female', 'boy', 'girl', 'student', 'teacher', 'doctor', 'nurse', 'chef', 'blacksmith', 'police', 'soldier', 'pirate', 'king', 'queen', 'prince', 'princess'],
  },
  {
    id: 'living', group: 'life', en: 'Home', hant: '家居', hans: '家居',
    icons: ['door', 'door-open', 'window', 'bedroom', 'armchair', 'chair', 'drawer', 'desk', 'bathtub', 'shower', 'bulb', 'soap', 'toothbrush'],
  },
  {
    id: 'food', group: 'life', en: 'Food and drink', hant: '飲食', hans: '饮食',
    icons: ['bread', 'sandwich', 'food', 'meat', 'vegetable', 'bowl', 'drink', 'coffee', 'tea', 'alcohol', 'bottle', 'mug', 'cup', 'glass'],
  },
  {
    id: 'clothing', group: 'life', en: 'Clothing', hant: '服飾', hans: '服饰',
    icons: ['hat', 'shirt', 'shorts', 'dress', 'gown', 'suit', 'slippers'],
  },
  {
    id: 'school', group: 'life', en: 'School', hant: '學校', hans: '学校',
    icons: ['university', 'homework', 'classroom', 'lecture', 'blackboard', 'chalk', 'pointer-stick'],
  },
  {
    id: 'sports', group: 'life', en: 'Sports and activities', hant: '運動與活動', hans: '运动与活动',
    icons: ['walking', 'running', 'hiking', 'swimming', 'swimming-pool', 'badminton', 'basketball', 'football', 'ball'],
  },
  {
    id: 'celebrations', group: 'life', en: 'Celebrations', hant: '節慶', hans: '节庆',
    icons: ['gift', 'balloon', 'kite', 'christmas-tree'],
  },

  {
    id: 'emoji', group: 'culture', en: 'Emoji and reactions', hant: '表情與反應', hans: '表情与反应',
    icons: ['thumb-up', 'thumb-down', 'fist', 'fingers-crossed'],
  },
  {
    id: 'stationery', group: 'culture', en: 'Stationery and art', hant: '文具與美術', hans: '文具与美术',
    icons: ['book', 'notebook', 'paper', 'leaflet', 'contract', 'write', 'paint', 'drawing', 'pixel', 'scissors', 'clip', 'sticker'],
  },
  { id: 'flags', group: 'culture', en: 'Flags', hant: '旗幟', hans: '旗帜', icons: ['flag-hk', 'flag-cn', 'flag-jp', 'flag-kr', 'flag-us', 'flag-uk'] },
  { id: 'hong-kong', group: 'culture', en: 'Hong Kong', hant: '香港', hans: '香港', icons: [] },
];
