import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: `${config.get<string>('MONGO_DB_HOST')}:${config.get<string>('MONGO_DB_PORT')}/${config.get<string>('MONGO_DB_DATABASE_NAME')}`,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
