"use strict";

module.exports = function(eficiencia) {
  /**
   * Saca la produccion del mes por usuario y numero de mes y año
   * @param {string} UserId Id del usuario
   * @param {string} MesyAno El Mes y año en el que se va a buscar
   * @param {Function(Error, array)} callback
   */

  eficiencia.ProduccionMes = function(UserId, MesyAno, callback) {
    var Resultado;
    var sumatoria = 0;
    eficiencia
      .find({
        filter: {
          where: {
            UserId: UserId
          }
        }
      })
      .then(logs => {
        var MesconAño = MesyAno.split("-");
        var CAño = MesconAño[0];
        var Cmes = MesconAño[1];
        logs.forEach(Produccion => {
          var AñoMes = Produccion.Dia.split("-");
          var Año = AñoMes[0];
          var Mes = AñoMes[1];
          if (CAño == Año && Cmes == Mes) {
            sumatoria = sumatoria + Produccion.valor;
          }
        });

        Resultado = sumatoria;
        callback(null, Resultado);
      });
  };
};
