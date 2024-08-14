import { SetMetadata } from '@nestjs/common';

export const PublicResource = () => SetMetadata('isPublic', true);
