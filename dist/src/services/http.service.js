"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpService = exports.HttpServiceOptions = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const got_1 = __importDefault(require("got"));
const logger_service_1 = require("../logger/logger.service");
const prom_client_1 = __importDefault(require("prom-client"));
const rxjs_1 = require("rxjs");
const service_1 = require("./service");
const redis_1 = require("redis");
class SocketsServerOptions {
    constructor() {
        this.enabled = false;
        this.redisPrefix = null;
        this.cors = null;
    }
}
class HttpServiceOptions {
    constructor() {
        this.port = 3000;
        this.socketsServer = new SocketsServerOptions();
        this.token = null;
        this.host = null;
    }
}
exports.HttpServiceOptions = HttpServiceOptions;
let HttpService = class HttpService extends service_1.Service {
    constructor(logger) {
        super();
        this.logger = logger;
        this.options = new HttpServiceOptions;
        this.server = null;
        this.deferred = {};
        this.PromClient = prom_client_1.default;
        this.metricsCollected = new rxjs_1.Subject();
    }
    static config(handler) {
        return super.config(handler);
    }
    onInit() {
        const log = this.logger.action('HttpService.start');
        this.express = (0, express_1.default)();
        // set up http server
        this.server = http_1.default.createServer(this.express);
        this.server.listen(this.options.port);
        // express configs
        this.express.use(body_parser_1.default.json({ limit: '10mb' })); // support json encoded bodies
        this.express.use(body_parser_1.default.urlencoded({ extended: true, limit: '10mb' })); // support encoded bodies
        this.express.use((req, _res, next) => // set params
         {
            req.parsed = { params: {} };
            for (var i in req.body) {
                req.parsed.params[i] = req.body[i];
            }
            for (var i in req.query) {
                req.parsed.params[i] = req.query[i];
            }
            next();
        });
        this.setDefaultRoutes();
        log.info("HTTP server started");
        if (this.options.socketsServer.enabled) {
            this.startSocketsServer();
        }
    }
    setDefaultRoutes() {
        this.route("/ping", () => {
            return 'pong';
        });
        this.route("/metrics", (params, res) => {
            try {
                const promRegister = prom_client_1.default.register;
                res.set('Content-Type', promRegister.contentType);
                res.end(promRegister.metrics());
                const collect = typeof (params.collect) != 'undefined' ? +params.collect : 1;
                if (collect) {
                    this.metricsCollected.next();
                }
            }
            catch (ex) {
                res.status(500).end(ex);
            }
            return null;
        });
    }
    startSocketsServer() {
        const log = this.logger.action('HttpService.startSocketsServer');
        const options = this.options.socketsServer;
        const ioOptions = {};
        if (options.cors !== null) {
            ioOptions.cors = options.cors;
        }
        this.io = new socket_io_1.Server(ioOptions);
        this.io.attach(this.server);
        if (options.redisHost && options.redisPort) {
            const clientOptions = {
                host: options.redisHost,
                port: options.redisPort,
            };
            const pubClient = new redis_1.RedisClient(clientOptions);
            const subClient = pubClient.duplicate();
            const adapterOptions = {};
            if (options.redisPrefix !== null) {
                adapterOptions.key = options.redisPrefix;
            }
            this.io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient, adapterOptions));
        }
        log.info("Sockets server started");
    }
    onStop() {
        const log = this.logger.action('HttpService.onStop');
        if (this.options.socketsServer.enabled) {
            this.io.close();
            log.info("Sockets server stopped");
        }
        this.server.close();
        log.info("HTTP server stopped");
    }
    route(route, handler) {
        if (typeof (handler) === 'string') {
            this.express.use(route, express_1.default.static(handler));
            return;
        }
        const callback = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let response;
            //const requestParams = new RequestParams(req.parsed.params);
            const requestParams = req.parsed.params;
            try {
                if (Array.isArray(handler)) {
                    const controller = handler[0];
                    const method = handler[1];
                    response = yield controller[method](requestParams, res, req);
                }
                else {
                    response = yield handler(requestParams, res, req);
                }
            }
            catch (error) {
                response =
                    {
                        result: 'error',
                        error: error.message
                    };
            }
            if (response === null) {
                return;
            }
            switch (typeof (response)) {
                case 'object':
                    {
                        res.setHeader('Content-Type', 'application/json');
                        try {
                            response = JSON.stringify(response);
                        }
                        catch (error) {
                            response = "";
                        }
                        break;
                    }
                case 'string': break;
                default: response = "";
            }
            res.send(response);
        });
        this.express.route(route).get(callback).post(callback);
    }
    debounce(id, timeout, callback) {
        if (typeof (this.deferred[id]) != 'undefined')
            return;
        this.deferred[id] = setTimeout(() => {
            delete this.deferred[id];
            callback();
        }, timeout);
    }
    get(url, params) {
        let params_str = "";
        params.token = this.options.token;
        if (params) {
            let params_arr = [];
            for (let name in params) {
                params_arr.push(`${name}=${params[name]}`);
            }
            params_str = params_arr.length ? "?" + params_arr.join('&') : "";
        }
        const got_url = `http://${this.options.host}${url}${params_str}`;
        return (0, got_1.default)(got_url).json();
    }
    post(url, params) {
        params.token = this.options.token;
        url = `http://${this.options.host}${url}`;
        return got_1.default.post(url, { json: params }).json();
    }
    onMetricsCollected(callback) {
        this.metricsCollected.subscribe(callback);
    }
};
HttpService = __decorate([
    (0, service_1.Inject)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], HttpService);
exports.HttpService = HttpService;
//# sourceMappingURL=http.service.js.map