goog.provide('shaka.abr.HoltBandwidthEstimator');
goog.require('shaka.abr.Holt');

/**
 * Inicialización de la clase
 *
 * @constructor
 */
shaka.abr.HoltBandwidthEstimator = function() {
    this.algorithm = new shaka.abr.Holt();
};

/**
 * Recibe una nueva observación a partir de la cual calcula
 * la siguiente estimación
 *
 * @param duration_ms Tiempo de descarga del GOP en ms
 * @param n_bytes Longitud del GOP en bytes
 */
shaka.abr.HoltBandwidthEstimator.prototype.sample =
    function(duration_ms, n_bytes) {

    // Tiempo de descarga en segundos
    let tau = duration_ms/1000;

    // Observación del ancho de banda
    let obs = (8*n_bytes)/tau;

    // Cálculo de la siguiente estimación
    this.algorithm.sample(tau, obs);
};

/**
 * Obtención de la última estimación calculada por el algoritmo
 * Holt
 *
 * @returns {number|*}
 */
shaka.abr.HoltBandwidthEstimator.prototype.getBandwidthEstimate
    = function() {
  return this.algorithm.getEstimate();
};

































