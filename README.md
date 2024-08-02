# cables development environment

[cables.gl](https://cables.gl) and [cables standalone](https://cables.gl/standalone) are mainly developed by [undev](https://undev.studio/),
with contributions by the [cables community](https://discord.gg/cablesgl) and support by [various other parties and projects](https://cables.gl/credits).

This is the repository that holds the parent directory for cables development. Read up about
setting up everything for your to start contributing to cables in the section on ["Developing Cables"](https://cables.gl/docs/6_1_developing_cables/developing_cables) 
of the official cables documentation.

If you want to learn more about the tools and processes involved, check our ["toolchain"](docs/toolchain.md) guide.

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

## Appreciation

Thanks to the [cables community](https://discord.gg/cablesgl) and our [supporters](https://cables.gl/credits) for making this possible. If you like this project, think about supporting it on [patreon](https://www.patreon.com/cables_gl).

This project was partly funded through the [NGI0 Entrust Fund](https://nlnet.nl/entrust/), a fund established by [NLnet](https://nlnet.nl/) with financial support
from the European Commission's [Next Generation Internet](https://www.ngi.eu/) programme, under the aegis of [DG Communications Networks](https://commission.europa.eu/about-european-commission/departments-and-executive-agencies/communications-networks-content-and-technology_en),
Content and Technology under grant agreement No 101069594.

## More...
- [tools involved](docs/toolchain.md)
- [howto create_new_ops](docs/howto_create_new_ops.md)
- [howto op_new_version](docs/howto_op_new_version.md)
- [howto libraries](docs/howto_libraries.md)
