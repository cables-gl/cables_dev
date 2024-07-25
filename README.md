# cables development environment

This is the repository that holds the parent directory for cables development. Read up about
setting up eveything for your to start contributing to cables in the section on ["Developing Cables"](https://cables.gl/docs/6_1_developing_cables/developing_cables) 
of the official cables documentation.

## Structure

cables development is spread across five git-repositories

### [cables_dev](https://github.com/cables-gl/cables_dev)

the current repository is the "root folder" for all cables development, it holds
documentation, helper scripts to set up your environment and keep it up to date.

it also contains shared code between the different projects and holds npm commands to run watchers
for file changes during development (see below).

### [cables](https://github.com/cables-gl/cables)

the cables repository holds all the core ops of cables, and everything that is needed
to run cables patches (in the editor, but also in exported patches).

### [cables_ui](https://github.com/cables-gl/cables_ui)

cables_ui contains all code that makes up the cables editor, the ui. everything that is needed
to work on patches on cables.gl and in cables standalone lives in this repository.

### [cables_electron](https://github.com/cables-gl/cables_electron)

the repository to bring all of the above together to have a running version of the cables ui
with the cables code and ops. runs (and builds/packs) an electron executable that can be
used to create patches locally, or develop on core and ui features on your local machine.

### [cables_extensionops](https://github.com/undev-studio/cables_extensionops)

a repository containing all the extensions on cables.gl that are not in the core. it is not
needed for local development but will give you a few more ops to work with.

## Giving Feedback

### Issue Workflow

- create an issue, pick "Bug report" or "Feature Request" from the templates
- the issue will be assigned a "new" label
- we will check on these issues regularly, add them to a milestone and remove the "new" label
- once we added the feature or fixed the bug in any release (also dev/nightly) we will close the issue
- stable releases will have a changelog with all the closed issues

## More...
- [howto changelog](docs/howto_changelog.md)
- [howto create_new_ops](docs/howto_create_new_ops.md)
- [howto op_new_version](docs/howto_op_new_version.md)
- [howto jsdoc](docs/howto_jsdoc.md)
- [howto libraries](docs/howto_libraries.md)
- [install community devenv](https://github.com/undev-studio/cables_api/blob/develop/docs/install.md)
