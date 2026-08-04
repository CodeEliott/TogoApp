/* speech.js - lecture des consignes a voix haute.

   Beaucoup d'enfants de 6 a 9 ans ne lisent pas encore assez vite pour
   comprendre une consigne ecrite. On utilise la synthese vocale du
   navigateur : aucun fichier son a installer.

   Mais attention : sur Windows XP il n'y a souvent AUCUNE voix francaise
   installee. L'application ne doit donc jamais dependre du son. Regle
   suivie partout dans le code : tout exercice destine aux petits doit
   rester comprehensible avec les seules images. Le son est un bonus. */

var Voix = (function () {

  var actif = true;
  var moteur = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
  var voixFr = null;
  var cherchee = false;

  function trouverVoix() {
    if (!moteur || cherchee) { return voixFr; }
    cherchee = true;
    try {
      var liste = moteur.getVoices() || [];
      for (var i = 0; i < liste.length; i++) {
        var lang = (liste[i].lang || '').toLowerCase();
        if (lang.indexOf('fr') === 0) { voixFr = liste[i]; break; }
      }
    } catch (e) { voixFr = null; }
    return voixFr;
  }

  /* Les voix arrivent parfois de facon asynchrone. */
  if (moteur && typeof moteur.addEventListener === 'function') {
    try {
      moteur.addEventListener('voiceschanged', function () { cherchee = false; trouverVoix(); });
    } catch (e) { /* sans importance */ }
  }

  function possible() { return !!moteur && !!trouverVoix(); }

  function dire(texte) {
    if (!actif || !moteur || !texte) { return false; }
    var v = trouverVoix();
    if (!v) { return false; }
    try {
      moteur.cancel();
      var u = new window.SpeechSynthesisUtterance(String(texte));
      u.voice = v;
      u.lang = v.lang || 'fr-FR';
      u.rate = 0.9;   /* un peu lent : ce sont des enfants */
      moteur.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function stop() { try { if (moteur) { moteur.cancel(); } } catch (e) { } }

  function setActif(v) { actif = !!v; if (!actif) { stop(); } }
  function estActif() { return actif; }

  return { dire: dire, stop: stop, possible: possible, setActif: setActif, estActif: estActif };
})();
