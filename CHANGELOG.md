# V0.4.2

### Fixes:

- Remove option redisDb
- Pass option redisPrefix to the socket.io Redis adapter

# V0.4.1

### Fixes:

- Avoid pass the redisDb option if it is not setted

# V0.4.0

### New:

- New options for the SocketsServerOptions: redisDb and redisPrefix

# V0.3.3

### Fixes:

- Outdated dependencies

# V0.3.2

### Fixes:

- Wrong type HttpService.debounce() callback parameter
 
# V0.3.1

### Security fixes:

- Potential vulnerabilities in dependencies

# V0.3.0

### New:

- Option cors in SocketsServerOptions

# V0.2.3

### Security fixes:

- Potential vulnerabilities in dependencies

# V0.2.2

### Security fixes:

- Upgrade packages

# V0.2.1

### Security fixes:

- Upgrade socket.io

# v0.2.0

### New:

- Improve MysqlService error handling
- New logs level 'silly' and 'http' in LoggerModule
- http() and silly() added to the ActionLoggerService 

# v0.1.2

### Security fixes:

- Upgrade socket.io-redis

# v0.1.1

### Fixes:

- Declarations of submodules are not available to parent modules
- Singletons are not initialized in the order declared
- logger not found on Module.onStop() after remove the singletons instances
- Log errors on uncaughtException

# v0.1.0

### New:

- First draft of the framework, implement Module, Service, Controller, @Inject with ProviderService and @Route with HttpService

- Support submodules

- Configurable modules

- Routes default error response when throw Error

- Parse route handler return

- Implement MysqlService

- Implement LoggerModule

- The Logger auto encodes message to JSON if it is a object

- The Logger accepts more than one message argument

- Request parameters
- Docs



