import { expect } from 'chai';
import sinon from 'sinon';
import selectMenuHandler from './testSelectMenuHandler.js';

describe('testSelectMenuHandler (stub)', () => {
  let interaction, replyStub;

  beforeEach(() => {
    replyStub = sinon.stub().resolves();
    interaction = {
      customId: 'myMenu',
      values: ['optA', 'optB'],
      reply: replyStub,
    };
  });

  it('should reply with ephemeral true and correct content', async () => {
    await selectMenuHandler.handle(interaction);

    expect(replyStub.calledOnce).to.be.true;
    const payload = replyStub.firstCall.args[0];
    expect(payload.content).to.equal('[TEST SELECT MENU] You selected: optA, optB');
    expect(payload.ephemeral).to.be.true;
  });
});
