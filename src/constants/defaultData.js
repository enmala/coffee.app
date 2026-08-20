export const DEFAULT_RECIPES = [
  {
    id: 'v60-tetsu-kasuya',
    name: 'Método 4:6 (Tetsu Kasuya)',
    method: 'V60',
    is_favorite: false,
    coffee_g: 20,
    grind_size: 'Gruesa (Coarse)',
    water_temp_c: 92,
    steps: [
      { step_number: 1, title: 'Preparación y purgado', water_g: 0, duration_s: 0, instruction: 'Coloca el filtro de papel en el V60, enjuaga con agua caliente para purgar sabores a papel y precalentar el cono, descarta el agua y agrega los 20g de café molido.' },
      { step_number: 2, title: 'Preinfusión', water_g: 50, duration_s: 45, instruction: 'Vierte 50g de agua lentamente.' },
      { step_number: 3, title: 'Segundo Vertido', water_g: 70, duration_s: 45, instruction: 'Vierte hasta los 120g de agua acumulados.' },
      { step_number: 4, title: 'Tercer Vertido', water_g: 60, duration_s: 30, instruction: 'Vierte rápidamente hasta llegar a los 180g.' },
      { step_number: 5, title: 'Cuarto Vertido', water_g: 60, duration_s: 30, instruction: 'Vierte hasta alcanzar los 240g.' },
      { step_number: 6, title: 'Quinto Vertido', water_g: 60, duration_s: 30, instruction: 'Último vertido hasta finalizar en 300g.' }
    ]
  },
  {
    id: 'aeropress-standard',
    name: 'Aeropress Tradicional',
    method: 'Aeropress',
    is_favorite: false,
    coffee_g: 15,
    grind_size: 'Medio-Fina',
    water_temp_c: 85,
    steps: [
      { step_number: 1, title: 'Preparación y enjuague', water_g: 0, duration_s: 0, instruction: 'Coloca el filtro de papel en la tapa de la Aeropress, enjuaga con agua caliente para eliminar sabores a papel y enrosca firmemente.' },
      { step_number: 2, title: 'Llenado y agitación', water_g: 220, duration_s: 10, instruction: 'Vierte todo el agua rápidamente y agita durante 10 segundos.' },
      { step_number: 3, title: 'Reposo', water_g: 0, duration_s: 50, instruction: 'Coloca el émbolo ligeramente para hacer vacío y espera.' },
      { step_number: 4, title: 'Prensado', water_g: 0, duration_s: 30, instruction: 'Presiona el émbolo suavemente hacia abajo durante 30 segundos.' }
    ]
  },
  {
    id: 'moka-estandar',
    name: 'Moka - Estándar',
    method: 'Moka',
    is_favorite: false,
    coffee_g: 18,
    grind_size: 'Fina',
    water_temp_c: 70,
    steps: [
      { step_number: 1, title: 'Llenar agua', water_g: 250, duration_s: 0, instruction: 'Verter agua caliente hasta justo debajo de la válvula de seguridad.' },
      { step_number: 2, title: 'Colocar cesta', water_g: 0, duration_s: 0, instruction: 'Insertar el filtro de la cesta sin mojar el café.' },
      { step_number: 3, title: 'Agregar café', water_g: 0, duration_s: 0, instruction: 'Rellenar la cesta con 18g. Nivelar con dedo, no apretar.' },
      { step_number: 4, title: 'Ensamblar', water_g: 0, duration_s: 0, instruction: 'Cerrar la moka firmemente. Usar paño si está caliente.' },
      { step_number: 5, title: 'Calentar', water_g: 0, duration_s: 240, instruction: 'Colocar a fuego bajo-medio. Dejar tapa abierta.' },
      { step_number: 6, title: 'Monitorear', water_g: 0, duration_s: 60, instruction: 'Cuando el café suba con burbujas doradas, reducir fuego.' },
      { step_number: 7, title: 'Retirar', water_g: 0, duration_s: 0, instruction: 'Antes de que termine el siseo fuerte, retirar del fuego.' },
      { step_number: 8, title: 'Enfriar', water_g: 0, duration_s: 10, instruction: 'Sumergir base en agua fría o envolver con paño húmedo para detener extracción.' },
      { step_number: 9, title: 'Servir', water_g: 0, duration_s: 0, instruction: 'Verter inmediatamente. No dejar reposar en la moka.' }
    ]
  },
  {
    id: 'prensa-francesa-hoffmann',
    name: 'Prensa Francesa (Técnica Hoffmann)',
    method: 'Prensa Francesa',
    is_favorite: false,
    coffee_g: 30,
    grind_size: 'Gruesa (Coarse)',
    water_temp_c: 95,
    steps: [
      { step_number: 1, title: 'Vertido total', water_g: 500, duration_s: 30, instruction: 'Vierte 500g de agua hirviendo sobre los 30g de café procurando mojar todo el grano.' },
      { step_number: 2, title: 'Infusión inicial', water_g: 0, duration_s: 210, instruction: 'Coloca el émbolo en la parte superior sin bajarlo y deja infusionar durante 3:30.' },
      { step_number: 3, title: 'Romper costra', water_g: 0, duration_s: 0, instruction: 'Remueve suavemente la capa de café flotante con una cuchara para que se asiente al fondo.' },
      { step_number: 4, title: 'Limpiar espuma', water_g: 0, duration_s: 0, instruction: 'Retira la espuma y partículas flotantes de la superficie utilizando dos cucharas.' },
      { step_number: 5, title: 'Decantación final', water_g: 0, duration_s: 300, instruction: 'Deja reposar sin mover la prensa durante 5 minutos para asentar todos los sedimentos.' },
      { step_number: 6, title: 'Servir', water_g: 0, duration_s: 0, instruction: 'Inserta el filtro rozando la superficie sin bajar hasta el fondo y sirve lentamente.' }
    ]
  },
  {
    id: 'matcha-tradicional-usucha',
    name: 'Matcha Tradicional (Usucha)',
    method: 'Matcha',
    category: 'tea',
    is_favorite: false,
    coffee_g: 2,
    grind_size: 'Polvo Fino (Cernido)',
    water_temp_c: 80,
    steps: [
      { step_number: 1, title: 'Tamizar Matcha', water_g: 0, duration_s: 0, instruction: 'Tamiza 2g de Matcha con un colador fino directamente sobre el cuenco (Chawan) para deshacer grumos.' },
      { step_number: 2, title: 'Agregar agua a 80°C', water_g: 70, duration_s: 0, instruction: 'Vierte 70g (70ml) de agua caliente a 80°C por el borde del cuenco.' },
      { step_number: 3, title: 'Batido con Chasen', water_g: 0, duration_s: 30, instruction: 'Bate enérgicamente en patrón de W o M con el batidor de bambú (Chasen) hasta crear una capa densa de espuma verde jade.' },
      { step_number: 4, title: 'Servir', water_g: 0, duration_s: 0, instruction: 'Pasa suavemente las puntas del Chasen para romper burbujas grandes y sirve inmediatamente.' }
    ]
  },
  {
    id: 'sencha-japones-tradicional',
    name: 'Té Verde Sencha Tradicional',
    method: 'Sencha',
    category: 'tea',
    is_favorite: false,
    coffee_g: 4,
    grind_size: 'Hoja Entera',
    water_temp_c: 70,
    steps: [
      { step_number: 1, title: 'Colocar hojas', water_g: 0, duration_s: 0, instruction: 'Coloca 4g de té verde Sencha en la tetera Kyusu o infusor.' },
      { step_number: 2, title: 'Primera Infusión', water_g: 200, duration_s: 60, instruction: 'Vierte 200g de agua a 70°C y deja reposar en infusión durante 60 segundos.' },
      { step_number: 3, title: 'Servir primera taza', water_g: 0, duration_s: 15, instruction: 'Vierte alternando entre tazas hasta vaciar la última gota para no sobre-infusionar.' },
      { step_number: 4, title: 'Segunda Infusión', water_g: 200, duration_s: 30, instruction: 'Reutiliza las hojas virtiendo 200g de agua a 75°C e infusiona por 30 segundos.' }
    ]
  }
];

export const DEFAULT_BEANS = [
  {
    id: 'bean-example-ethiopia',
    name: 'Etiopía Sidamo',
    roaster: 'Tostaduría Artesanal',
    origin: 'Etiopía',
    region: 'Sidama',
    farm: 'Finca Shantawene',
    producer: 'Daye Bensa',
    harvest_year: '2025',
    process: 'Lavado',
    variety: 'Heirloom',
    roast_level: 'Claro',
    roast_date: '2026-06-15',
    sca_score: 86.5,
    altitude: '1900 msnm',
    tasting_notes: ['Cítrico', 'Floral', 'Miel'],
    notes: 'Café muy floral y dulce con notas a jazmín y té negro.'
  }
];

export const DEFAULT_TASTING_NOTES = [
  'Frutos rojos', 'Cítrico', 'Chocolate', 'Cacao', 'Caramelo', 
  'Panela', 'Miel', 'Vainilla', 'Floral', 'Frutos secos', 'Especias', 'Herbal'
];

export const STEP_INSTRUCTION_SUGGESTIONS = [
  { label: '🌀 En círculos', text: 'Verter en círculos concéntricos desde el centro hacia afuera' },
  { label: '💧 Al centro', text: 'Verter agua lentamente en el centro' },
  { label: '🥄 Remover (swirl)', text: 'Remover suavemente con movimientos circulares (swirl)' },
  { label: '⏳ Dejar drenar', text: 'Dejar drenar todo el flujo de agua' },
  { label: '⬇️ Presionar émbolo', text: 'Presionar el émbolo con ritmo constante' },
  { label: '⏱️ Dejar en infusión', text: 'Dejar reposar en infusión' },
  { label: '☕ Servir', text: 'Servir inmediatamente y disfrutar' }
];

