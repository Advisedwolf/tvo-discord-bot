// tests/handlers/selectMenuHandler.spec.js
import { expect } from 'chai';
import sinon from 'sinon';
import selectMenuHandler from '../../src/handlers/selectMenuHandler.js';

describe('selectMenuHandler (production)', () => {
  let interaction, executeSpy;

  beforeEach(() => {
    // Stub interaction.reply so we can inspect ephemeral replies
    interaction = {
      isStringSelectMenu: () => true,
      customId: 'unknownMenu',
      client: { commands: new Map() },
      user: { locale: 'en' },
      reply: sinon.stub().resolves(),
      followUp: sinon.stub().resolves(),
    };

    // Prepare a registered command under 'myMenu'
    executeSpy = sinon.spy();
    interaction.client.commands.set('myMenu', { execute: executeSpy });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call execute() on a registered select menu command', async () => {
    interaction.customId = 'myMenu';
    await selectMenuHandler.handle(interaction);

    expect(executeSpy.calledOnceWith(interaction)).to.be.true;
    // No error reply
    expect(interaction.reply.notCalled).to.be.true;
  });

  it('should reply ephemerally if the select menu command is not found', async () => {
    interaction.customId = 'noSuchMenu';
    await selectMenuHandler.handle(interaction);

    // One ephemeral reply with an embed
    expect(interaction.reply.calledOnce).to.be.true;
    const callArg = interaction.reply.firstCall.args[0];
    expect(callArg).to.have.property('flags', 64);
    expect(callArg).to.have.property('embeds').that.is.an('array').with.lengthOf(1);
  });
});
