import { Module } from "../../src/index";
import AppController from "./app.controller";
export default class AppModule extends Module {
    declare(): ((typeof import("../../src/index").Service | import("../../src/index").ConfigHandler<any>)[] | typeof AppController)[];
    onInit(): void;
    onStop(reason: string): void;
    onError(error: Error): void;
}
