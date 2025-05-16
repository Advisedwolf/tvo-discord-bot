// tests/src/buttonHandler.spec.js
import { expect } from "chai";
import sinon from "sinon";
import { InteractionResponseFlags } from "discord.js";
import buttonHandler from "../../src/handlers/buttonHandler.js";

describe("buttonHandler (production)", () => {
  let interaction, executeSpy, client;

  beforeEach(() => {
    executeSpy = sinon.spy();
    client = { commands: new Map([["myButton", { execute: executeSpy }]]) };

    interaction = {
      isButton: () => true,
      customId: "myButton",
      client,
      reply: sinon.stub().resolves(),
    };
  });

  it("should call execute() on a registered button command", async () => {
    await buttonHandler.handle(interaction);
    expect(executeSpy.calledOnceWith(interaction)).to.be.true;
  });

  it("should reply with an error if the button command is not found", async () => {
    interaction.customId = "noSuchButton";
    await buttonHandler.handle(interaction);

    expect(interaction.reply.calledOnce).to.be.true;
    const payload = interaction.reply.firstCall.args[0];
    expect(payload.content).to.match(/button command.*not found/i);
    expect(payload.flags).to.equal(InteractionResponseFlags.EPHEMERAL);
  });
});
