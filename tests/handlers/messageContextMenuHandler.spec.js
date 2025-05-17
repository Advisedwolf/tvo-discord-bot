// tests/handlers/messageContextMenuHandler.spec.js
import { expect } from 'chai';
import sinon from 'sinon';
import messageContextMenuHandler from '../../src/handlers/messageContextMenuHandler.js';

describe('messageContextMenuHandler (production)', () => {
  let interaction, executeSpy;

  beforeEach(() => {
    // Stub interaction.reply for inspecting ephemeral replies
    interaction = {
      isMessageContextMenuCommand: () => true,
      commandName: 'unknownAction',
      client: { commands: new Map() },
      user: { locale: 'en' },
      reply: sinon.stub().resolves(),
      followUp: sinon.stub().resolves(),
    };

    // Prepare a registered command under 'messageAction'
    executeSpy = sinon.spy();
    interaction.client.commands.set('messageAction', { execute: executeSpy });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call execute() on a registered message context menu command', async () => {
    interaction.commandName = 'messageAction';
    await messageContextMenuHandler.handle(interaction);

    expect(executeSpy.calledOnceWith(interaction)).to.be.true;
    expect(interaction.reply.notCalled).to.be.true;
  });

  it('should reply ephemerally if the message context menu command is not found', async () => {
    interaction.commandName = 'noSuchMessageAction';
    await messageContextMenuHandler.handle(interaction);

    expect(interaction.reply.calledOnce).to.be.true;
    const arg = interaction.reply.firstCall.args[0];
    expect(arg).to.have.property('flags', 64);
    expect(arg).to.have.property('embeds').that.is.an('array').with.lengthOf(1);
  });
});
