import { Room, Client } from "@colyseus/core";
import { MyRoomState, Npc, Player } from "./schema/MyRoomState";

const defaultPlayerPosition = {
  x: 950,
  y: 600,
};

const defaultNpcHostPosition = {
  x: 1000,
  y: 520,
};

const roamingBounds = {
  minX: 600,
  maxX: 1450,
  minY: 400,
  maxY: 700,
};

const npcHostSpeed = 50;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export class MyRoom extends Room<MyRoomState> {
  update(deltaTime: number) {
    this.state.players.forEach((player) => {
      let input: any;

      while ((input = player.inputQueue.shift())) {
        let currentAnim = "idle";
        let flipX = false;

        player.x = input.x;
        player.y = input.y;

        if (input.velocityX < 0) {
          currentAnim = "walkleft";
        } else if (input.velocityX > 0) {
          currentAnim = "walkleft";
          flipX = true;
        }

        if (input.velocityY < 0) {
          currentAnim = "walkup";
        } else if (input.velocityY > 0) {
          currentAnim = "walkdown";
        }

        player.currentAnim = currentAnim;
        player.flipX = flipX;
      }
    });

    this.state.npcs.forEach((npc) => {
      let currentAnim = "idle";
      let flipX = false;

      npc.x = clamp(npc.x, roamingBounds.minX, roamingBounds.maxX);
      npc.y = clamp(npc.y, roamingBounds.minY, roamingBounds.maxY);

      if (npc.direction === "up") {
        npc.y -= (npcHostSpeed * deltaTime) / 1000;
        currentAnim = "shinwalk";
      } else if (npc.direction === "down") {
        npc.y += (npcHostSpeed * deltaTime) / 1000;
        currentAnim = "shinwalk";
      } else if (npc.direction === "left") {
        npc.x -= (npcHostSpeed * deltaTime) / 1000;
        currentAnim = "shinwalk";
      } else if (npc.direction === "right") {
        npc.x += (npcHostSpeed * deltaTime) / 1000;
        currentAnim = "shinwalk";
        flipX = true;
      } else if (npc.direction === "stop") {
        currentAnim = "shinchanidling";
      }

      npc.currentAnim = currentAnim;
      npc.flipX = flipX;
    });
  }

  changeNpcHostDirection() {
    const directions = ["up", "down", "left", "right", "stop"];
    const nextDirection =
      directions[Math.floor(Math.random() * directions.length)];

    switch (nextDirection) {
      case "up":
        this.state.npcs.get("npcHost").direction = "up";
        break;
      case "down":
        this.state.npcs.get("npcHost").direction = "down";
        break;
      case "left":
        this.state.npcs.get("npcHost").direction = "left";
        break;
      case "right":
        this.state.npcs.get("npcHost").direction = "right";
        break;
    }
  }

  onCreate(options: any) {
    this.setState(new MyRoomState());

    this.state.npcs.set(
      "npcHost",
      new Npc({
        direction: "stop",
        x: defaultNpcHostPosition.x,
        y: defaultNpcHostPosition.y,
        currentAnim: "shinchanidling",
        flipX: false,
      })
    );

    this.clock.setInterval(() => this.changeNpcHostDirection(), 3000);

    this.setSimulationInterval((deltaTime) => {
      this.update(deltaTime);
    });

    this.onMessage(0, (client, input) => {
      const player = this.state.players.get(client.sessionId);

      player.inputQueue.push(input);
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player({
      x: defaultPlayerPosition.x,
      y: defaultPlayerPosition.y,
      currentAnim: "idle",
      flipX: false,
    });

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
