import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ChatsService, type ChatVisibility } from './chats.service';

interface UpdateChatBody {
  title?: string | null;
  visibility?: ChatVisibility;
}

interface CreateChatBody {
  input?: string;
}

interface VoteBody {
  messageId: string;
  isUpvoted?: boolean;
}

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  list() {
    return this.chatsService.list();
  }

  @Post()
  create(@Body() body: CreateChatBody) {
    return this.chatsService.create(body.input?.trim());
  }

  @Get(':id/votes')
  listVotes(@Param('id') id: string) {
    return this.chatsService.listVotes(id);
  }

  @Post(':id/votes')
  setVote(@Param('id') id: string, @Body() body: VoteBody) {
    return this.chatsService.setVote(id, body.messageId, body.isUpvoted);
  }

  @Delete(':id/messages/:messageId')
  @HttpCode(204)
  removeMessage(@Param('id') id: string, @Param('messageId') messageId: string) {
    return this.chatsService.removeMessage(id, messageId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.chatsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateChatBody) {
    return this.chatsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.chatsService.remove(id);
  }
}
