var cron = require("node-cron");

var axios = require("axios");

cron.schedule(
  // 5 45 AM LUNES A VIERNES
  "45 5 * * 1-5",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
        },
        {
          headers: {
            Authorization:
              "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 19 * * 1-5",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
        },
        {
          headers: {
            Authorization:
              "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 21 * * 1-5",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
        },
        {
          headers: {
            Authorization:
              "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 23 * * 1-5",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
        },
        {
          headers: {
            Authorization:
              "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 6 * * 6",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
        },
        {
          headers: {
            Authorization:
              "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 23 * * 6",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
        },
        {
          headers: {
            Authorization:
              "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 19 * * 0",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
        },
        {
          headers: {
            Authorization:
              "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  }
);

cron.schedule(
  // 7 45 PM LUNES A VIERNES
  "45 23 * * 0",
  // Segun GuruCrontab  => At 09:00 Everyday 45 5 * * 1-5
  () => {
    axios
      .post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "e31f477a-2f06-4f77-b051-376694227a4c",
          included_segments: [
            "Pureplastic",
            "Agrofesam",
            "Agroindustria Gara",
            "Pureplastic",
            "TecnoFruit",
          ],
          data: { foo: "bar" },
          template_id: "8db1414c-8b29-44a3-89b2-1c36f991a14d",
          contents: {
            en:
              "!Cuidado¡ Falta poco para el cambio de horario, recuerda tomar tus precauciones.",
          },
          headings: { en: "CAMBIO DE HORARIO" },
        },
        {
          headers: {
            Authorization:
              "Basic M2M1NTE5YTQtYzNmYS00NDk0LTk2YjUtYTcyY2EyMTg5ZWVj",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  }
);
