import { IsBoolean, IsString, MaxLength, ValidateIf } from 'class-validator';
import type { CreateChatInput, SetMessageVoteInput, UpdateChatInput } from '@recovery-assistant/shared';

export class CreateChatDto implements CreateChatInput {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  input?: string;
}

export class UpdateChatDto implements UpdateChatInput {
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(256)
  title?: string | null;
}

export class SetMessageVoteDto implements SetMessageVoteInput {
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  isUpvoted?: boolean;
}
