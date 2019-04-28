# 🍬 sucre

ECS helper

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/sucre.svg)](https://npmjs.org/package/sucre)
[![Downloads/week](https://img.shields.io/npm/dw/sucre.svg)](https://npmjs.org/package/sucre)
[![License](https://img.shields.io/npm/l/sucre.svg)](https://github.com/mateomurphy/sucre/blob/master/package.json)

<!-- toc -->
* [🍬 sucre](#-sucre)
<!-- tocstop -->

## Usage

<!-- usage -->
```sh-session
$ npm install -g sucre
$ sucre COMMAND
running command...
$ sucre (-v|--version|version)
sucre/0.2.0 darwin-x64 node-v11.14.0
$ sucre --help [COMMAND]
USAGE
  $ sucre COMMAND
...
```
<!-- usagestop -->

## Commands

<!-- commands -->
* [`sucre help [COMMAND]`](#sucre-help-command)
* [`sucre logs [LOGGROUPNAME]`](#sucre-logs-loggroupname)

## `sucre help [COMMAND]`

display help for sucre

```
USAGE
  $ sucre help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `sucre logs [LOGGROUPNAME]`

Retrieves logs

```
USAGE
  $ sucre logs [LOGGROUPNAME]

OPTIONS
  -e, --env=env  environment
  -n, --num=num  number of lines to display
  --start=start  start of the time range
  --stop=stop    end of the time range
```

_See code: [src/commands/logs.js](https://github.com/mateomurphy/sucre/blob/v0.2.0/src/commands/logs.js)_
<!-- commandsstop -->
