/* app.js - démarrage. */

(function () {

  function demarrer() {
    try {
      App.demarrer();
    } catch (e) {
      /* Si quelque chose casse, l'enfant doit voir un message lisible et
         non une page blanche. */
      var d = document.getElementById('ecran');
      if (d) {
        d.innerHTML = '<div class="page"><h2>Un problème est survenu</h2>' +
          '<p>Ferme la page et rouvre index.html. Si cela recommence, note ce message et montre-le à l\'animateur :</p>' +
          '<p class="alerte"></p></div>';
        var p = d.getElementsByClassName('alerte')[0];
        if (p) { p.appendChild(document.createTextNode(String(e && e.message ? e.message : e))); }
      }
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    demarrer();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', demarrer, false);
  } else {
    window.onload = demarrer;
  }
})();
