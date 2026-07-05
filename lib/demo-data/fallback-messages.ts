export const FALLBACK_REMINDERS: Record<
  string,
  { adultMessage: string; caregiverMessage: string; alertLevel: string }
> = {
  medication: {
    adultMessage:
      "Buenos días, Don Manuel. Es momento de tomar su medicamento para la presión. Cuando termine, puede presionar el botón verde de 'Ya tomé mi medicamento'.",
    caregiverMessage:
      "Hora del medicamento de la mañana de Don Manuel. Pendiente de confirmación.",
    alertLevel: "none",
  },
  meal: {
    adultMessage:
      "Hola, Don Manuel. Su almuerzo se aproxima. Recordemos no incluir tortilla, evitar demasiada sal y acompañar con una fruta.",
    caregiverMessage:
      "Hora del almuerzo de Don Manuel. Recordar evitar tortillas y reducir la sal.",
    alertLevel: "none",
  },
  appointment: {
    adultMessage:
      "Don Manuel, hoy tiene cita con el cardiólogo a las tres de la tarde. No olvide llevar sus documentos y exámenes.",
    caregiverMessage:
      "Don Manuel tiene cita con cardiólogo hoy a las 3:00 PM.",
    alertLevel: "none",
  },
  exam: {
    adultMessage:
      "Buenos días, Don Manuel. Hoy tiene examen de sangre. Recuerde seguir las indicaciones registradas por su familia.",
    caregiverMessage: "Don Manuel tiene examen de sangre programado.",
    alertLevel: "none",
  },
  mood: {
    adultMessage:
      "¿Cómo se siente hoy, Don Manuel? Puede elegir una opción en pantalla.",
    caregiverMessage: "Recordatorio de check-in emocional para Don Manuel.",
    alertLevel: "none",
  },
};

export const FALLBACK_COMPANION = {
  reply:
    "Lamento escuchar eso, Don Manuel. Estoy aquí para acompañarlo. También puedo avisar a Ana para que pueda llamarlo.",
  suggestAlert: true,
  alertType: "mood" as const,
  severity: "medium" as const,
};

export const FALLBACK_TTS_TEXTS: Record<string, string> = {
  medication:
    "Buenos días, Don Manuel. Es momento de tomar su medicamento para la presión. Cuando termine, puede presionar el botón verde de Ya tomé mi medicamento.",
  meal: "Hola, Don Manuel. Su almuerzo se aproxima. Recordemos no incluir tortilla y evitar el exceso de sal. Una fruta como la sandía puede ser una buena opción.",
  companion:
    "Hola, Don Manuel. Estoy aquí para acompañarlo. Cuénteme, ¿cómo se siente hoy?",
  appointment:
    "Don Manuel, hoy tiene cita con el cardiólogo a las tres de la tarde. No olvide llevar sus documentos y exámenes.",
  exam: "Buenos días, Don Manuel. Hoy tiene examen de sangre. Recuerde seguir las indicaciones registradas por su familia.",
  mood: "¿Cómo se siente hoy, Don Manuel? Puede elegir una opción en pantalla.",
};
