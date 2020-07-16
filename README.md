# Rsk explorer api

## Description
  
  Rsk blockchain explorer

## Components

### Api server

### Blocks service
  Imports blockchain data from rsk node to db.

### User events service
  (Optional)
 Allows to update fields on the fly and send async response to clients.

## Requisites

- mongodb > 4
- node >= 12.18.2
- access to JSON/RPC interface of a rskj node >= 2.0.1
  with this modules enabled: eth, net, web3, txpool, debug and trace.

## Install

- Install dependencies

``` shell
    npm install
  ```

## Create log dir

```shell
sudo mkdir /var/log/rsk-explorer
sudo chown $USER /var/log/rsk-explorer/
chmod 755 /var/log/rsk-explorer
```

Note: You can change the log folder in config.json

## Configuration file 
(optional)

``` shell
    cp config-example.json config.json
  ```

see [configuration](#configuration)


## Start

### Services

Services can be started manually one by one, but we recommend to use [PM2](https://github.com/Unitech/pm2).
This repo includes a pm2 ecosystem file that starts all services automatically.

#### Install PM2

``` shell
  npm install -g pm2
```

To enable pm2 log rotation

``` shell
  pm2 install pm2-logrotate
```

see [pm2-logrotate](https://pm2.keymetrics.io/docs/usage/log-management/#pm2-logrotate-module)
see [pm2-logrotate configuration](https://github.com/keymetrics/pm2-logrotate#configure) to set the rotation options

e.g:

```shell
pm2 set pm2-logrotate:compress true
```

#### Start services

```shell
pm2 start dist/services/blocks.config.js
```

### API

``` shell
  pm2 start dist/api/api.config.js
```

## Commands

Run api in development mode

``` shell
    npm run dev
  ```

Run blocks service in development mode

``` shell
    npm run blocks
  ```

Production build to ./dist folder

``` shell
    npm run build
  ```

## Configuration
  
  **config.json**
  See defaults on: **lib/defaultConfig**
  *(config.json overrides this values)*

  Use:
  
  ```shell
  node dist/tools/showConfig.js
  ```

  to check current configuration
  
**Configuration Example:**

``` javascript
   "source": {
    "node": "localhost",
    "port": 4444
  },
  "api": {
    "address": "localhost",
    "port": 3003
  },
  "db": {
    "server": "localhost",
    "port": 27017,
    "database": "blockDB"
  }

  ```

The contractVerifier module requires a connection to a [rsk-contract-verifier](https://github.com/rsksmart/rsk-contract-verifier)
instance. The url must be provided on api section:

```javascript
"api":{
  "contractVerifier": {
      "url": "ws://localhost:3008"
    }
}

```

### Source

  **node**: "localhost",
  **port**: 4444

### db

  **server**": "localhost"
  **port**": 27017
  **database**: "explorerDB"

**Optionals:**

  **user**: < user >
  **password**: < password >

### blocks
  
  **validateCollections** :[Boolean] Validate collections at blocks service start
  **blocksQueueSize**:[Number]
  **bcTipSize**:[Number] BC tip size

### api
  **address** [string] api server bind address
  **port**  [number] api server port

  **allowUserEvents** [boolean]: enable/disable userEventsApi
  **exposeDoc** [boolean]: serve rsk-openapi-ui on /doc to render swagger.json

## Documentation
  
 - [api documentation](doc/api.md)
 - [open api specification](public/swagger.json)
