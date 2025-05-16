// tests/handlers/buttonHandler.spec.js
import { expect } from "chai";
import sinon from "sinon";
import buttonHandler from "../../src/handlers/buttonHandler.js";

describe("buttonHandler (production)", () => {
  let interaction, executeSpy;

  beforeEach(() => {
    // 1) Stub interaction.reply so we can inspect calls
    interaction = {
      isButton: () => true,
      customId: "missingButton",
      user: { locale: "en" },
      client: { commands: new Map() },
      reply: sinon.stub().resolves(),
      followUp: sinon.stub().resolves(),
      replied: false,
      deferred: false,
    };

    // 2) For the success case
    executeSpy = sinon.spy();
    interaction.client.commands.set("myButton", { execute: executeSpy });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call execute() on a registered button command", async () => {
    interaction.customId = "myButton";
    await buttonHandler.handle(interaction);

    expect(executeSpy.calledOnceWith(interaction)).to.be.true;
    expect(interaction.reply.notCalled).to.be.true;
  });

  it("should reply ephemerally if the button command is not found", async () => {
    interaction.customId = "unknownBtn";
    await buttonHandler.handle(interaction);

    // We expect reply() to have been called exactly once
    expect(interaction.reply.calledOnce).to.be.true;

    // Check the flags to ensure ephemeral (Discord flag 64)
    const replyArg = interaction.reply.firstCall.args[0];
    expect(replyArg.flags).to.equal(64);

    // The content is your localized error key, embedded via replyError()
    expect(replyArg.embeds).to.be.an("array").with.lengthOf(1);
    // Optionally inspect embed.description for the translated message
  });
});
