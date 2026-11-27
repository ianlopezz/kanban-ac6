# Kanban Pro: confeti i arrossegament de tasques

Aplicació Kanban d'una sola pàgina amb confeti en completar tasques i arrossegament de targetes entre columnes. La interfície manté una estètica d'internet dels anys 2000.

## Com obrir l'aplicació

Obre `demo-proj/index.html` en un navegador. La pàgina carrega les llibreries des de CDN (servidors que distribueixen fitxers públics); cal connexió a internet perquè es carreguin Dragula, Driver.js, FullCalendar i canvas-confetti.

## Funcionalitat 1: celebrar les tasques completades

La funcionalitat de confeti es va implementar abans de l'arrossegament. Utilitza **canvas-confetti 1.9.3**, llibreria (codi JavaScript reutilitzable) que crea partícules animades en un canvas (superfície de dibuix dins la pàgina). Es va triar perquè permet definir l'origen de cada llançament, personalitzar les partícules amb icones de text i configurar l'animació amb poques opcions, sense afegir un framework.

### Objectes i funcions del confeti

| Element | Ús |
| --- | --- |
| `FORMES` | Conjunt d'icones retro en forma de text: estrelles, disquets, cercapersones i CD. Es creen amb `confetti.shapeFromText()` (converteix un caràcter en una forma de partícula). |
| `BASE` | Opcions compartides per a les animacions: formes, colors, `scalar` (mida de les partícules), `zIndex` (ordre de superposició visual) i respecte pel moviment reduït. |
| `confettiOn` | Estat booleà (valor que només pot ser cert o fals) que indica si la celebració automàtica està activada. |
| `celebrar(el, force)` | Llança 60 partícules des del centre de l'element HTML `el`. `force` permet al botó de prova executar-la encara que l'interruptor estigui desactivat. |
| `celebrarTaulell()` | Llança una animació gran de 250 partícules quan totes les tasques estan fetes i mostra el popup de felicitació. |
| `mostrarFelicitats()` | Mostra el popup fins que l'usuari hi fa clic. |
| `localStorage` | Emmagatzematge persistent del navegador (dades que es conserven després de tancar la pàgina) on es desa la preferència de l'interruptor. |

### Quan s'activa

Quan una tasca passa a «Fet», tant amb el selector com arrossegant-la a la columna, es crida `celebrar(card)`. Si totes les tasques tenen l'estat `done`, 400 ms després s'executa `celebrarTaulell()` amb una celebració de pantalla i el popup. El retard dona temps a veure primer el confeti que surt de la targeta.

El control «Confeti» desa la preferència a `localStorage` i la restaura en carregar la pàgina. «Prova confeti» crida `celebrar(..., true)`, per tant permet veure l'efecte encara que l'usuari hagi desactivat la celebració automàtica. L'opció `disableForReducedMotion` (desactiva l'animació per a persones que han indicat al sistema que prefereixen menys moviment) millora l'accessibilitat.

## So dels GIFs del peu de pàgina

En fer clic sobre el GIF `gif1.gif` del peu de pàgina es reprodueixen els primers dos segons de `demo-proj/img/aud/kangerscream - BPR_Jon.mp3`. El so també es pot activar amb Enter o la barra espaiadora. Es crea un objecte `Audio` (reproductor de so del navegador), que es reinicia al principi cada vegada que es prem el GIF i s'atura al cap de dos segons.

En prémer «Prova confeti» sona `demo-proj/img/aud/fnaf-12-3-freddys-nose-sound.mp3` i es torna a iniciar des del principi en cada prova.

## Funcionalitat addicional: arrossegar targetes

### Llibreria triada: Dragula

S'utilitza **Dragula 3.7.3** per gestionar l'arrossegament. S'ha triat perquè funciona amb JavaScript sense framework (eina gran que imposa una estructura d'aplicació), permet moure elements entre diversos contenidors i dona indicacions visuals mentre es mou la targeta.

La llibreria es carrega amb el seu JavaScript i full d'estils des de jsDelivr. No s'ha afegit cap dependència de codi al servidor ni cap pas de compilació.

### Objectes, funcions i opcions utilitzats

| Element | Ús |
| --- | --- |
| `taskLists` | Col·lecció dels tres contenidors on Dragula accepta targetes: «Per fer», «En curs» i «Fet». |
| `statusByList` | Mapa (relació entre claus i valors) que converteix l'identificador HTML de cada columna en l'estat intern de la tasca. |
| `state` | Array (llista de dades en JavaScript) amb les tasques i els seus camps, inclòs `status`. |
| `kanbanDrake` | Instància de Dragula (objecte configurat de la llibreria que controla l'arrossegament del taulell). |
| `initDragula()` | Crea i configura Dragula després que les targetes inicials s'hagin dibuixat. |
| `createTaskCard(task)` | Genera l'element HTML d'una targeta a partir de les dades de la tasca. |
| `renderAllTasks()` | Dibuixa de nou les targetes de `state` a les columnes i actualitza el comptador. |
| `dragula(taskLists, options)` | Funció principal que activa l'arrossegament sobre les tres llistes. |
| `moves` | Opció que filtra l'inici del moviment: només es pot començar des d'una targeta, i els botons i selectors continuen funcionant. |
| `accepts` | Opció que valida el contenidor de destí; només permet deixar targetes a les tres columnes del Kanban. |
| `revertOnSpill` | Opció que retorna la targeta a la seva posició si es deixa anar fora d'una columna vàlida. |
| `kanbanDrake.on('drop', ...)` | Escoltador d'esdeveniment (funció que s'executa quan passa una acció) que sincronitza l'estat quan l'usuari deixa anar una targeta. |

### Integració amb l'aplicació

Les targetes ja es renderitzaven (es creaven i es mostraven a la pàgina) dins de `#todo-list`, `#in-progress-list` i `#done-list`. Dragula utilitza aquests mateixos elements com a contenidors: no cal canviar l'estructura del Kanban ni la plantilla de targeta.

Quan es deixa anar una targeta, el callback (funció cridada després de l'esdeveniment) consulta `target.id`, actualitza `task.status` i el selector d'estat de la targeta. Després reconstrueix l'ordre de `state` segons l'ordre dels elements al DOM (estructura d'elements HTML que el navegador mostra). Això conserva el reordenament quan la interfície es torni a renderitzar.

El moviment no crida `renderAllTasks()` en cada solta, per evitar reconstruir totes les targetes i provocar salts visuals. Si la targeta acaba a «Fet», es reutilitza `celebrar()`; si totes les tasques han estat completades, també es crida `celebrarTaulell()`.

Cada `.task-list` té una alçada mínima, de manera que una columna buida també ofereix una zona àmplia on deixar anar targetes. Les classes CSS (regles visuals de la pàgina) de Dragula (`.gu-mirror`, `.gu-transit` i `.gu-over`) s'estilitzen amb els colors, vores i efectes retro de la pàgina: la còpia que segueix el cursor, la posició d'origen i el contenidor de destí respectivament.

## Funcionalitat 2: tutorial «Ajuda»

El botó «Ajuda» inicia `startTour()`, que utilitza Driver.js per destacar els controls i mostrar instruccions. El tutorial ara explica, pas a pas, com:

1. Crear una tasca.
2. Arrossegar-la des del bloc de la targeta.
3. Deixar-la anar en una altra columna, incloent-hi una columna buida.
4. Reordenar targetes dins la mateixa columna.
5. Completar una tasca i veure el confeti.
6. Fer servir el control de confeti, el comptador i la vista de calendari.

Les descripcions del tutorial són en català, com la interfície de l'aplicació.

## Prova manual

1. Crea més d'una tasca amb el formulari.
2. Arrossega una targeta a una columna buida i comprova que el selector mostri el nou estat.
3. Mou una targeta entre altres targetes de la mateixa columna per canviar-ne l'ordre.
4. Deixa una tasca a «Fet» i comprova el confeti quan està activat.
5. Prem «Ajuda» i segueix els passos sobre el moviment.

## Dades

Les tasques viuen a la variable `state` mentre la pàgina està oberta; no es desen de manera persistent (no es recuperen després de tancar o recarregar la pàgina). `localStorage` (emmagatzematge local del navegador) només guarda la preferència del confeti i el comptador de visites.
