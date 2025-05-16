// tests/handlers/slashHandler.spec.js
import { expect } from "chai";
import sinon from "sinon";
import slashHandler from "../../src/handlers/slashHandler.js";

describe("slashHandler (production)", () => {
  let interaction, executeSpy;

  beforeEach(() => {
    // Stub out reply so we can inspect calls:
    interaction = {
      isChatInputCommand: () => true,
      commandName: "unknown",
      client: { commands: new Map() },
      user: { locale: "en" },
      reply: sinon.stub().resolves(),
      followUp: sinon.stub().resolves(),
    };

    // Register a dummy "exists" command for the success case:
    executeSpy = sinon.spy();
    interaction.client.commands.set("exists", { execute: executeSpy });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call execute() on a registered command and not send an ephemeral reply", async () => {
    interaction.commandName = "exists";
    await slashHandler.handle(interaction);

    expect(executeSpy.calledOnceWith(interaction)).to.be.true;
    expect(interaction.reply.notCalled).to.be.true;
  });

  it("should reply ephemerally if the command is not found", async () => {
    interaction.commandName = "unknown";
    await slashHandler.handle(interaction);

    // Exactly one ephemeral reply
    expect(interaction.reply.calledOnce).to.be.true;
    const replyArg = interaction.reply.firstCall.args[0];
    expect(replyArg).to.have.property("flags", 64);
    expect(replyArg.embeds).to.be.an("array").with.lengthOf(1);
  });
});
