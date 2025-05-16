import { expect } from "chai";
import sinon from "sinon";
import messageContextMenuHandler from "./testMessageContextMenuHandler.js";
import { MessageFlags } from "discord.js";

describe("testMessageContextMenuHandler (stub)", () => {
  let interaction, replyStub;

  beforeEach(() => {
    replyStub = sinon.stub().resolves();
    interaction = {
      commandName: "messageAction",
      reply: replyStub,
    };
  });

  it("should reply ephemerally with the stub content", async () => {
    await messageContextMenuHandler.handle(interaction);

    expect(replyStub.calledOnce).to.be.true;
    const payload = replyStub.firstCall.args[0];
    expect(payload.content).to.equal(
      "[TEST ENV] Message context menu command received: messageAction",
    );
    expect(payload.flags).to.equal(MessageFlags.Ephemeral);
  });
});
