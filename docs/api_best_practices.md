* model files in `models/` should have singular name (i.e. `team.js`)
* model files should contain all functions that are connected to querying the database (i.e. `findTeamsByProject` or `addCollaborator`)
* use `await` and `async` only when really doing asynchronous stuff, in general as little as possible

* endpoints should be placed in `endpoints` and be named `something_endpoint.js`
* endpoints contain everything that responds in http
* routes are seperated into `setRoutesApi`, `setRoutesViews` and `setRoutesOther`, returning json, html and "other" respectively
* route functions CAN be `async` to use models (see above), do not use `async` functions for something else, if needed delegate to model

* views should be placed in `views/`, if they are placed in a subdirectory their name should double that (`team/team_invites.html`)

* general shared code that is not related to models (services, tracking, logging, ...) should be placed in `utils/`
* this part IS NOT allowed to have `async` functions, if not otherwise possible, use callbacks
