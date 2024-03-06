"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Capability = /** @class */ (function () {
    function Capability(name, code, endpoint, handler) {
        this.endpoint = endpoint;
        this.handler = handler;
        this.name = name;
        this.code = code;
    }
    Capability.prototype.getCode = function () {
        return this.code;
    };
    ;
    Capability.prototype.getEndpoint = function () {
        return this.endpoint;
    };
    Capability.prototype.getHandler = function () {
        return this.handler;
    };
    return Capability;
}());
exports.default = Capability;
