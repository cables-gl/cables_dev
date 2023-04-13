## CustomOp:

wird deprecated, weil das loading komplett anders ist als was
wir sonst in cables machen.

### UseCases:
- Code der wirklich nur ein einem einzigen patch gebraucht wird
- Taucht nicht im opselect auf, "müllt" die suche nicht zu

### Discussions:
- Wann deprecaten?
- Brauchen wir sowas wie "PatchOps" für obigen usecase?

## PatchOps:

wäre ein op der nur in einem patch exisitert, und nur hier benutzt
und bearbeitet werden kann

### UseCases:
- "wegwerfcode"
- Einfacher weg mal eine neue library auszuprobieren und code zu teilen

### Discussions:
- Namespace? Ops.Patch.shortId (sanitize)
- copy or refrence copy
- copy on clipboard paste
- libloading from patch assets (use reference, copy over? upload to ops/?)

## UserOp:

UserOps gehören einem einzelnen User und funktionieren so wie core ops.
Es gibt keinen update-mechanismus.

### Namespace:
Ops.User.username.

### Permissions:
- Besitzer kann op hinzufügen
- Collaborators können op hinzufügen
- In public patches können alle den op sehen
- In public patches können alle den op code sehen
- Nur der besitzer kann den op code editieren

### UseCases:
- Ops die nur für den user oder collaborators interessant sind (private APIs, custom code)
- Projekte in denen nur eine person ops entwickelt
- Einfacher weg mal eine neue library auszuprobieren und code zu teilen

### Discussions:
- Soll es den normalen update-mechanismus auch für userops geben? nein
- Will man das publishen von patches mit userops verbieten?
 - nein, beim clone werden userops zu patchops
 - /code/user/stephan kann secured werden
 - secure "add op by name" somehow

## TeamOp:

TeamOps verhalten sich wie userops, können aber von mehreren leuten editiert
werden. teamops können versioniert sein und geupdated werden.

### Namespace:
Ops.Team.teamname.

### Permissions:
- Aktuell können nur admins teamops erstellen
- Mitglieder im Team können Ops zu ALLEN ihren patches hinzufügen (auch wenn der patch nicht dem team zugehörig ist)
- Mitglieder im Team mit "write" permission können team-op-code editieren
- können nicht in public patches existieren

### UseCases:
- Ein eingeschränkter Kreis von Leuten soll zugriff auf spezielle ops haben
- Projekte in denen mehrere leute ops entwickeln, bzw mehrere leute an einem op arbeiten
- Testumgebung für neue Ops die dann Core oder Extension werden

### Discussions:
- Sind Teampermission so sinnvoll? Sollten sich diese auch auf patches beziehen oder umbenannt werden?
-- umbenennen nach "op editor" oder sowas
- will man für teamops einen "Dev" namespace haben?
- nein

## ExtensionOp:

ExtensionOps verhalten sich wie core ops werden aber "nachgeladen" und nur die
extension selber taucht im opsearch auf.

### Namespace:
Ops.Extension.extensionname.

### Permissions:
- Aktuell können nur admins extensions erstellen
- ExtensionOps sind read-only (ausser für admin/staff)
- Extension namespaces gehören einem team

### UseCases:
- Eine Sammlung von Ops soll allen Nutzern auf cables zur verfügung gestellt werden, ohne dass sie in "core" landen
- Aussortieren von selten benötigten ops in extensions.

### Discussions:
- Macht es sinn extensions and teams zu hängen?
-- ja, weil man braucht jemanden der ansprechpartner ist
