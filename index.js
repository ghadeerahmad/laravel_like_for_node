"use strict";
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
const enums_1 = require("./database/Migration/enums");
const Migration_1 = __importDefault(require("./database/Migration/Migration"));
const Model_1 = __importDefault(require("./database/Model/Model"));
class User extends Model_1.default {
}
const users = new Migration_1.default('users', { type: { type: enums_1.ColumnType.enum, choices: ['user', 'customer'] } });
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        yield users.run();
    });
}
test();
