import { expect } from 'chai';
import sinon from 'sinon';
import buttonHandler from './testButtonHandler.js';
import { MessageFlags } from 'discord.js';

describe('testButtonHandler (stub)', () => {
  let interaction, replyStub;

  beforeEach(() => {
    replyStub = sinon.stub().resolves();
    interaction = {
      customId: 'myButton',
      reply: replyStub,
    };
  });

  it('should reply ephemerally with the stub content', async () => {
    await buttonHandler.handle(interaction);

    expect(replyStub.calledOnce).to.be.true;
    const payload = replyStub.firstCall.args[0];
    expect(payload.content).to.equal('[TEST ENV] Button clicked: myButton');
    expect(payload.flags).to.equal(MessageFlags.Ephemeral);
  });
});
