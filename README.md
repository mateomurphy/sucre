🍬 sucre
========

ECS helper

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/sucre.svg)](https://npmjs.org/package/sucre)
[![Downloads/week](https://img.shields.io/npm/dw/sucre.svg)](https://npmjs.org/package/sucre)
[![License](https://img.shields.io/npm/l/sucre.svg)](https://github.com/mateomurphy/sucre/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g sucre
$ sucre COMMAND
running command...
$ sucre (-v|--version|version)
sucre/0.4.0 darwin-x64 node-v11.14.0
$ sucre --help [COMMAND]
USAGE
  $ sucre COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`sucre help [COMMAND]`](#sucre-help-command)
* [`sucre logs [LOGGROUPNAME]`](#sucre-logs-loggroupname)
* [`sucre logs:groups [LOGGROUPNAMEPREFIX]`](#sucre-logsgroups-loggroupnameprefix)
* [`sucre logs:streams [LOGGROUPNAME]`](#sucre-logsstreams-loggroupname)
* [`sucre services`](#sucre-services)
* [`sucre services:info [SERVICENAME]`](#sucre-servicesinfo-servicename)
* [`sucre services:redeploy [SERVICENAME]`](#sucre-servicesredeploy-servicename)
* [`sucre tasks:definitions [FAMILYPREFIX]`](#sucre-tasksdefinitions-familyprefix)
* [`sucre tasks:families`](#sucre-tasksfamilies)
* [`sucre tasks:run`](#sucre-tasksrun)

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

retrieve logs

```
USAGE
  $ sucre logs [LOGGROUPNAME]

OPTIONS
  -e, --end=end        end of the time range
  -n, --num=num        number of lines to display
  -p, --prefix=prefix  filter log stream by prefix
  -s, --start=start    start of the time range
  -t, --tail           tail logs
```

_See code: [src/commands/logs/index.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/logs/index.ts)_

## `sucre logs:groups [LOGGROUPNAMEPREFIX]`

retrieve log streams

```
USAGE
  $ sucre logs:groups [LOGGROUPNAMEPREFIX]
```

_See code: [src/commands/logs/groups.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/logs/groups.ts)_

## `sucre logs:streams [LOGGROUPNAME]`

retrieve log streams

```
USAGE
  $ sucre logs:streams [LOGGROUPNAME]

OPTIONS
  -p, --prefix=prefix  filter log stream by prefix
```

_See code: [src/commands/logs/streams.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/logs/streams.ts)_

## `sucre services`

describe services

```
USAGE
  $ sucre services

OPTIONS
  -C, --cluster=cluster  the cluster of the services
```

_See code: [src/commands/services/index.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/services/index.ts)_

## `sucre services:info [SERVICENAME]`

describe a service

```
USAGE
  $ sucre services:info [SERVICENAME]

OPTIONS
  -C, --cluster=cluster  the cluster of the service
  -w, --watch            watch for changes
```

_See code: [src/commands/services/info.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/services/info.ts)_

## `sucre services:redeploy [SERVICENAME]`

redeploys a service

```
USAGE
  $ sucre services:redeploy [SERVICENAME]

OPTIONS
  -C, --cluster=cluster  the cluster of the service
```

_See code: [src/commands/services/redeploy.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/services/redeploy.ts)_

## `sucre tasks:definitions [FAMILYPREFIX]`

list task definitions

```
USAGE
  $ sucre tasks:definitions [FAMILYPREFIX]
```

_See code: [src/commands/tasks/definitions.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/tasks/definitions.ts)_

## `sucre tasks:families`

list task definition families

```
USAGE
  $ sucre tasks:families
```

_See code: [src/commands/tasks/families.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/tasks/families.ts)_

## `sucre tasks:run`

run a one-off process inside a container

```
USAGE
  $ sucre tasks:run

OPTIONS
  -C, --cluster=cluster                            the cluster to run on
  -c, --container=container                        the container to use
  -f, --task-definition-path=task-definition-path  the path to a task definition json file
  -t, --task-definition=task-definition            the task definition to use
  --log-group-name=log-group-name
  --log-stream-name-prefix=log-stream-name-prefix

ALIASES
  $ sucre run
```

_See code: [src/commands/tasks/run.ts](https://github.com/mateomurphy/sucre/blob/v0.4.0/src/commands/tasks/run.ts)_
<!-- commandsstop -->
