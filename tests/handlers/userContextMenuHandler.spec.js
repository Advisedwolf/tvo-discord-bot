// tests/handlers/userContextMenuHandler.spec.js
import { expect } from "chai";
import sinon from "sinon";
import userContextMenuHandler from "../../src/handlers/userContextMenuHandler.js";

describe("userContextMenuHandler (production)", () => {
  let interaction, executeSpy;

  beforeEach(() => {
    // Stub interaction.reply so we can inspect ephemeral replies
    interaction = {
      isUserContextMenuCommand: () => true,
      commandName: "noSuchUserAction",
      client: { commands: new Map() },
      user: { locale: "en" },
      reply: sinon.stub().resolves(),
      followUp: sinon.stub().resolves(),
    };

    // Prepare a registered command under 'userAction'
    executeSpy = sinon.spy();
    interaction.client.commands.set("userAction", { execute: executeSpy });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call execute() on a registered user context menu command", async () => {
    interaction.commandName = "userAction";
    await userContextMenuHandler.handle(interaction);

    // execute() called, no ephemeral reply
    expect(executeSpy.calledOnceWith(interaction)).to.be.true;
    expect(interaction.reply.notCalled).to.be.true;
  });

  it("should reply ephemerally if the user context menu command is not found", async () => {
    interaction.commandName = "unknownUserAction";
    await userContextMenuHandler.handle(interaction);

    // One ephemeral reply
    expect(interaction.reply.calledOnce).to.be.true;
    const arg = interaction.reply.firstCall.args[0];
    expect(arg).to.have.property("flags", 64);
    expect(arg).to.have.property("embeds").that.is.an("array").with.lengthOf(1);
  });
});
