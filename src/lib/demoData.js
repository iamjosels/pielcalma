export const familyProfile = {
  caregiver: "Ana",
  child: "Lucas",
  age: 4,
  context: "dermatitis atópica",
};

export const calmScore = {
  score: 72,
  label: "Calma Familiar",
  max: 100,
  note: "Refleja cómo te has sentido esta semana al acompañar a Lucas. No es un indicador clínico.",
};

export const emotionOptions = [
  {
    id: "tranquila",
    label: "Estoy tranquila",
    icon: "smile",
    response:
      "Qué bueno leer eso, Ana. Puedes usar este momento para registrar cómo va Lucas y guardar una foto si lo deseas. Estás haciendo un gran trabajo acompañándolo.",
  },
  {
    id: "dudas",
    label: "Tengo dudas",
    icon: "help-circle",
    response:
      "Es normal tener dudas. PielCalma puede ayudarte a ordenar lo que observas para conversarlo con el dermatólogo. No necesitas tener todas las respuestas ahora.",
  },
  {
    id: "preocupada",
    label: "Estoy preocupada",
    icon: "heart",
    response:
      "Tu preocupación es comprensible. Respira un momento. Registrar lo que ves puede darte claridad sin entrar en pánico. Estoy aquí para ayudarte a organizar la información.",
  },
  {
    id: "agotada",
    label: "Estoy agotada",
    icon: "moon",
    response:
      "Cuidar a Lucas requiere mucha energía, y está bien reconocer el cansancio. Hoy puedes hacer un registro breve y descansar. No tienes que resolverlo todo en un solo día.",
  },
];

export const sleepOptions = ["bueno", "regular", "malo"];

export const zoneOptions = [
  "cuello",
  "brazos",
  "piernas",
  "rostro",
  "pliegues",
];

export const triggerOptions = [
  "calor",
  "sudor",
  "polvo",
  "detergente nuevo",
  "comida nueva",
  "estrés",
  "mascota",
];

export const routineOptions = ["completa", "parcial", "no realizada"];

export const anaEmotionOptions = [
  { id: "tranquila", label: "Tranquila" },
  { id: "dudas", label: "Con dudas" },
  { id: "preocupada", label: "Preocupada" },
  { id: "agotada", label: "Agotada" },
];

export const simulatedVisualObservation =
  "Se observa enrojecimiento visible y resequedad aparente en la zona registrada. Respecto al último registro, la extensión visual parece ligeramente mayor. Esta observación puede verse afectada por iluminación, distancia y ángulo. No constituye diagnóstico médico.";

export const visualChangeIndex = {
  value: 18,
  label: "Índice Visual de Cambio",
  note: "No es un índice clínico ni una medida de severidad médica. Solo describe un cambio visual aparente entre registros.",
};

export const weeklyItchChart = [
  { day: "Lun", itch: 4 },
  { day: "Mar", itch: 6 },
  { day: "Mié", itch: 5 },
  { day: "Jue", itch: 7 },
  { day: "Vie", itch: 6 },
  { day: "Sáb", itch: 5 },
  { day: "Dom", itch: 4 },
];

export const weeklyReportTable = [
  {
    day: "Lunes",
    sleep: "bueno",
    itch: 4,
    triggers: "calor",
    routine: "completa",
  },
  {
    day: "Martes",
    sleep: "regular",
    itch: 6,
    triggers: "sudor, calor",
    routine: "parcial",
  },
  {
    day: "Miércoles",
    sleep: "regular",
    itch: 5,
    triggers: "polvo",
    routine: "completa",
  },
  {
    day: "Jueves",
    sleep: "malo",
    itch: 7,
    triggers: "estrés, calor",
    routine: "parcial",
  },
  {
    day: "Viernes",
    sleep: "regular",
    itch: 6,
    triggers: "detergente nuevo",
    routine: "completa",
  },
  {
    day: "Sábado",
    sleep: "bueno",
    itch: 5,
    triggers: "mascota",
    routine: "completa",
  },
  {
    day: "Domingo",
    sleep: "bueno",
    itch: 4,
    triggers: "—",
    routine: "completa",
  },
];

export const observedPatterns = [
  "Posible coincidencia entre días con calor y registros de mayor comezón.",
  "En algunos días con sueño regular o malo, Ana reportó sentirse más preocupada.",
  "La rutina indicada aparece como parcial principalmente en días de mayor actividad.",
];

export const suggestedQuestions = [
  "¿Conviene ajustar algo en la rutina de cuidado cuando hay días de calor?",
  "¿Qué zonas conviene observar con más atención según lo registrado esta semana?",
  "¿Cómo interpretar los cambios visuales aparentes entre fotos?",
  "¿Qué señales conviene anotar antes de la próxima consulta?",
];

export const visualObservationsReport = [
  "Enrojecimiento visible y resequedad aparente en pliegues del cuello.",
  "Respecto al registro anterior, la extensión visual parece ligeramente mayor.",
  "Las observaciones pueden variar según iluminación, distancia y ángulo.",
];

export const homeFeatures = [
  {
    title: "Modo Calma",
    description: "Acompañamiento emocional para ordenar lo que sientes sin entrar en pánico.",
    href: "/calma",
    color: "lavender",
  },
  {
    title: "Registrar brote",
    description: "Anota comezón, sueño, zonas y posibles desencadenantes de forma sencilla.",
    href: "/registro",
    color: "calm-blue",
  },
  {
    title: "Observador Visual",
    description: "Compara fotos con observaciones descriptivas, sin diagnóstico.",
    href: "/observador",
    color: "soft-green",
  },
  {
    title: "Reporte Médico",
    description: "Resume la semana con gráficos y preguntas para el dermatólogo.",
    href: "/reporte",
    color: "lavender",
  },
];

export const whatPielCalmaDoes = [
  "Ayuda a reducir la ansiedad al acompañar el cuidado de la piel de tu hijo.",
  "Organiza registros de brotes, sueño y posibles desencadenantes.",
  "Ofrece observaciones visuales descriptivas, nunca diagnósticos.",
  "Genera reportes claros para conversar con el dermatólogo entre consultas.",
];

export const demoCalmScore = calmScore;

export const demoSymptoms = weeklyReportTable.map((row, index) => ({
  id: index + 1,
  name: `Comezón ${row.itch}/10`,
  intensity: row.itch,
  date: row.day,
}));

export const demoObservations = visualObservationsReport.map((note, index) => ({
  id: index + 1,
  area: "Zona registrada",
  note,
  date: "Esta semana",
}));
