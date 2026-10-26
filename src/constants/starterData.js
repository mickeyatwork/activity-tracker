export const AVATAR_OPTIONS = ['🏃', '🤸‍♀️', '🏊‍♂️', '🚴', '⚽', '🏀', '🎾', '🥋'];

export const COLOR_OPTIONS = [
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500'
];

export const STARTER_TEMPLATES = [
  {
    id: 't_quadkids',
    name: 'Quadkids Athletics',
    description: '4 events focusing on sprinting, endurance, throwing and jumping.',
    icon: 'Trophy',
    metrics: [
      { id: 'm1', name: '75m Sprint', type: 'time', unit: 'sec' },
      { id: 'm2', name: '600m Run', type: 'time', unit: 'min:sec' },
      { id: 'm3', name: 'Standing Long Jump', type: 'distance', unit: 'm' },
      { id: 'm4', name: 'Vortex Howler', type: 'distance', unit: 'm' }
    ]
  },
  {
    id: 't_football',
    name: 'Football Match',
    description: 'Weekend league game tracking.',
    icon: 'Activity',
    metrics: [
      { id: 'm5', name: 'Goals/Assists', type: 'number', unit: '' },
      { id: 'm6', name: 'Great Passes', type: 'number', unit: '' },
      { id: 'm7', name: 'Effort Level', type: 'rating', unit: '/5' }
    ]
  }
];
