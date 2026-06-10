import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class DecisionDto {
  @IsIn(['approved', 'rejected', 'changes_requested'])
  decision!: 'approved' | 'rejected' | 'changes_requested';

  // mandatory rationale for negative decisions; optional (but validated) on approval
  @ValidateIf(
    (dto: DecisionDto) =>
      dto.decision !== 'approved' || dto.comment !== undefined,
  )
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  comment?: string;
}
