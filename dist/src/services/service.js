"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.Inject = void 0;
const inject_decorator_1 = require("../decorators/inject.decorator");
exports.Inject = inject_decorator_1.InjectDecorator;
let Service = class Service {
    static config(handler) {
        return [this, handler];
    }
    init() {
        this.onInit();
    }
    onInit() {
    }
    stop() {
        this.onStop();
    }
    onStop() {
    }
};
Service = __decorate([
    (0, exports.Inject)()
], Service);
exports.Service = Service;
//# sourceMappingURL=service.js.map