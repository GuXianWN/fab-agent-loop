import { ChatEntity } from './chat.entity';
import { MessageEntity } from './message.entity';
import { MessageVoteEntity } from './message-vote.entity';
import { UserEntity } from './user.entity';

export { ChatEntity } from './chat.entity';
export { MessageEntity } from './message.entity';
export { MessageVoteEntity } from './message-vote.entity';
export { DEMO_USER_ID, UserEntity } from './user.entity';

export const databaseEntities = [UserEntity, ChatEntity, MessageEntity, MessageVoteEntity];
