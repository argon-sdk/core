import { InteractionsApi } from './sub/interactions'
import { ArchetypesApi } from './sub/archetypes'
import { VoiceEgressApi } from './sub/voice-egress'
import { CommandsApi } from './sub/commands'
import { ReactionsApi } from './sub/reactions'
import { MessagesApi } from './sub/messages'
import { ChannelsApi } from './sub/channels'
import { BotSelfApi } from './sub/bot-self'
import { MembersApi } from './sub/members'
import { SpacesApi } from './sub/spaces'
import { TypingApi } from './sub/typing'
import { VoiceApi } from './sub/voice'
import { CallsApi } from './sub/calls'
import { BaseApiClient } from './base'

export type { RegisterCommandParams, UpdateCommandParams, CommandOption, BotCommand } from './sub/commands'
export type { SendMessageParams, SendMessageResponse, MessageHistoryParams } from './sub/messages'
export type { CallAcceptance, RingingCall, RingingCallsResponse, RejectCallResponse } from './sub/calls'
export type { VoiceTrackSubscription, DeletedResponse } from './sub/voice-egress'
export type { ModalDefinition, ModalControl } from '../controls/modal'
export type { SelectOption } from '../controls/base'
export type { CreateChannelParams, DeleteChannelParams } from './sub/channels'
export type { BatchGetReactionsResponse, MessageReactions } from './sub/reactions'
export type { BotSpaceDetail, BotMember } from './sub/spaces'
export type { BotSelf, BotSpaceBase } from './sub/bot-self'
export type { VoiceStreamToken } from './sub/voice'
const DEFAULT_BASE_URL = 'https://gateway.argon.zone'

/** High-level API client providing access to all platform endpoints */
export class ApiClient extends BaseApiClient {
  readonly self: BotSelfApi
  readonly messages: MessagesApi
  readonly channels: ChannelsApi
  readonly spaces: SpacesApi
  readonly archetypes: ArchetypesApi
  readonly reactions: ReactionsApi
  readonly members: MembersApi
  readonly commands: CommandsApi
  readonly typing: TypingApi
  readonly interactions: InteractionsApi
  readonly voice: VoiceApi
  readonly calls: CallsApi
  readonly voiceEgress: VoiceEgressApi

  constructor(token: string, baseUrl: string = DEFAULT_BASE_URL, debug: boolean = false) {
    super(token, baseUrl, debug)

    this.self = new BotSelfApi(this)
    this.messages = new MessagesApi(this)
    this.channels = new ChannelsApi(this)
    this.spaces = new SpacesApi(this)
    this.archetypes = new ArchetypesApi(this)
    this.reactions = new ReactionsApi(this)
    this.members = new MembersApi(this)
    this.commands = new CommandsApi(this)
    this.typing = new TypingApi(this)
    this.interactions = new InteractionsApi(this)
    this.voice = new VoiceApi(this)
    this.calls = new CallsApi(this)
    this.voiceEgress = new VoiceEgressApi(this)
  }
}
