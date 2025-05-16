import { expect } from "chai";
import sinon from "sinon";
import modalHandler from "./testModalHandler.js";
import { MessageFlags } from "discord.js";

describe("testModalHandler (stub)", () => {
  let interaction, replyStub;

  beforeEach(() => {
    replyStub = sinon.stub().resolves();
    interaction = {
      customId: "myModal",
      reply: replyStub,
    };
  });

  it("should reply ephemerally with the stub content", async () => {
    await modalHandler.handle(interaction);

    expect(replyStub.calledOnce).to.be.true;
    const payload = replyStub.firstCall.args[0];
    expect(payload.content).to.equal("[TEST ENV] Modal submitted: myModal");
    expect(payload.flags).to.equal(MessageFlags.Ephemeral);
  });
});
