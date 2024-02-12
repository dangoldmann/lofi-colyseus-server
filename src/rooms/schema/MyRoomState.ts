import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("string") currentAnim: string;
  @type("boolean") flipX: boolean;
  inputQueue: any[] = [];
}

export class Npc extends Schema {
  @type("string") direction: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("string") currentAnim: string;
  @type("boolean") flipX: boolean;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Npc }) npcs = new MapSchema<Npc>();
}
