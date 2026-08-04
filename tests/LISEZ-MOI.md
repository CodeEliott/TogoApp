# Tests

Ces tests ne servent pas aux enfants : ils servent à qui modifie
l'application. Ils demandent Node.js, sur un ordinateur de développement —
pas sur les postes de l'orphelinat.

```
node tests/verifier-questions.js    # fabrique 158 400 questions et les contrôle
node tests/verifier-moteur.js       # simule 4 profils d'enfants
node tests/verifier-navigateur.js   # joue aux 22 activités dans un vrai navigateur
```

## `verifier-questions.js`

Appelle chaque générateur 400 fois, pour chaque niveau et chaque mode, et
vérifie qu'aucune question n'est cassée : texte présent et sans `undefined`,
une seule bonne réponse, pas deux propositions identiques (deux boutons
portant le même texte sont incompréhensibles pour un enfant), réponse
saisissable au pavé numérique, explication présente.

Il vérifie aussi que **chaque notion sait produire au moins trois
représentations différentes**. Sans cela, le moteur ne validerait jamais la
maîtrise et l'enfant tournerait en rond indéfiniment. À lancer après tout
ajout d'exercice.

## `verifier-moteur.js`

Simule quatre enfants et vérifie que le moteur pédagogique se comporte comme
prévu :

- **A**, qui comprend, valide la notion — mais **pas** en une seule journée ;
- **B**, qui répond par cœur (rapide et juste en répétition, perdu au
  transfert), ne valide **jamais** la notion malgré ses bonnes réponses, et
  est signalé à l'animateur ;
- **C**, qui clique au hasard, ne progresse pas ;
- **D**, rapide mais qui réussit aussi les transferts, n'est **pas** signalé
  à tort — c'est le contrôle qui évite de punir les enfants simplement
  rapides.

## `verifier-navigateur.js`

Nécessite `npm install playwright`. Crée un joueur, joue les 22 activités en
entier (176 questions), effectue un vrai glisser-déposer à la souris, ouvre
l'espace animateur, recharge la page et vérifie que les progrès ont bien
survécu. Échoue à la moindre erreur JavaScript.
