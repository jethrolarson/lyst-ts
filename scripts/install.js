#!/usr/bin/env node
/* tslint:disable:no-console */
const Validate = require('git-validate');
//Add a precommit hook. Looks at package.json::pre-commit for commands
console.log('Installing git hooks');
Validate.installHooks('pre-push');
