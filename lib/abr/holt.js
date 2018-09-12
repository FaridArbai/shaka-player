goog.provide('shaka.abr.Holt');
goog.require('goog.asserts');

/**
 * Inicialización de la clase
 *
 * @constructor
 */
shaka.abr.Holt = function() {
    // Valores óptimos para la inicialización
    // de alpha y beta
    this.ALPHA_INIT = 0.05;
    this.BETA_INIT = 0.91;

    // Mínimo ancho de banda a estimar
    this.MIN_BW = 500e3;

    // Mínimo número de observaciones antes de
    // empezar a ejecutar el algoritmo
    this.MIN_UPDATES = 2;

    // Valores de alpha y beta iniciales
    this.alpha = this.ALPHA_INIT;
    this.beta = this.BETA_INIT;

    // Estimación del nivel
    this.s = 0;

    // Última estimación del nivel
    this.s_ant = 0;

    // Estimación de la pendiente
    this.b = 0;

    // Última estimación de la pendiente
    this.b_ant = 0;

    // Tiempo de descarga del último GOP
    this.tau = 0;

    // Número de observaciones
    this.n_updates = 0;

    // Último valor predicho
    this.pred = 0;

    // Observación inicial
    this.initial_obs = 0;
}

/**
 * Recibe una observación de ancho de banda y de retardo
 * y estima con ellos el nivel y la tendencia a usar
 * cuando se desee realizar una predicción
 *
 * @param tau Tiempo de descarga del último GOP
 * @param obs Última observación del ancho de banda
 */
shaka.abr.Holt.prototype.sample = function(tau, obs){
    this.updateParameters(tau);

    if(this.n_updates==0){
        this.initial_obs = obs;
        this.n_updates += 1;
        return;
    }
    else if(this.n_updates==1){
        this.s_ant = obs;
        this.b_ant = (obs - this.initial_obs)/tau;
    }

    this.s = (1-this.alpha)*this.pred +
        this.alpha*obs;

    this.b = (1-this.beta)*this.b_ant +
        this.beta*((this.s-this.s_ant)/tau);

    this.s_ant = this.s;
    this.b_ant = this.b;
    this.tau = tau;

    this.n_updates += 1;
}

/**
 * Actualización de los parámetros alpha y beta en base al
 * último retardo observado.
 *
 * @param tau Retardo en la descarga del GOP
 */
shaka.abr.Holt.prototype.updateParameters = function(tau){
    this.updateAlpha(tau);
    this.updateBeta(tau);
}

/**
 * Actualización del parámetro alpha en base al retardo
 * observado.
 *
 * @param tau
 */
shaka.abr.Holt.prototype.updateAlpha = function(tau){
    let correction = Math.pow((1-this.ALPHA_INIT), tau);
    this.alpha = (this.alpha/(this.alpha + correction));
}

/**
 * Actualización del parámetro beta en base al retardo
 * observado
 *
 * @param tau
 */
shaka.abr.Holt.prototype.updateBeta = function(tau){
    let correction = Math.pow((1-this.BETA_INIT), tau);
    this.beta = (this.beta/(this.beta + correction));
}

/**
 * Obtención de la predicción en base al nivel y a la
 * tendencia estimadas en la función sample
 *
 * @returns {*|number}
 */
shaka.abr.Holt.prototype.getEstimate = function() {
    let prediction = 0;

    if(this.n_updates >= this.MIN_UPDATES){
        prediction = this.s + this.tau*this.b;

        if(prediction < this.MIN_BW) {
          prediction = this.MIN_BW;
        }
    }
    else{
        prediction = this.MIN_BW;
    }

    console.log(prediction);

    return prediction;
}
