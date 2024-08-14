import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { Connection, Model } from 'mongoose';
import { request, spec } from 'pactum';
import { AppModule } from '../src/app.module';
import { User } from '../src/auth/schemas';
import {
  ChangePasswordDto,
  SignupDto,
  EditUserDto,
  SigninDto,
} from '../src/auth/dtos';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let db: Connection;

  beforeAll(async () => {
    db = await mongoose.createConnection(
      `${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_DATABASE_NAME}`,
      {},
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          `${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_DATABASE_NAME}`,
        ),
        AppModule,
      ],
    }).compile();

    const userModel: Model<User> = moduleFixture.get<Model<User>>(
      getModelToken(User.name),
    );

    await userModel.deleteMany({});

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    app.listen(3001);

    request.setBaseUrl('http://localhost:3001');
  });

  afterAll(() => {
    app.close();
  });

  describe('AUTH /auth', () => {
    describe('POST /auth/local/signup', () => {
      const signupRequest = () => spec().post('/auth/local/signup');
      const signupDto: SignupDto = {
        name: 'John',
        email: 'johndoe@gmail.com',
        password: 'Johndoe@123',
      };

      it('should throw an error if name is not provided in the body', () => {
        const dto: Omit<SignupDto, 'name'> = {
          email: signupDto.email,
          password: signupDto.password,
        };

        return signupRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if email is not provided in the body', () => {
        const dto: Omit<SignupDto, 'email'> = {
          name: signupDto.name,
          password: signupDto.password,
        };

        return signupRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if password is not provided in the body', () => {
        const dto: Omit<SignupDto, 'password'> = {
          name: signupDto.name,
          email: signupDto.email,
        };

        return signupRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if provided password is not strong enough', () => {
        const dto: SignupDto = {
          name: signupDto.name,
          email: signupDto.email,
          password: '123',
        };

        return signupRequest().withBody(dto).expectStatus(400);
      });

      it('should signup', () => {
        return signupRequest()
          .withBody(signupDto)
          .expectStatus(201)
          .stores('access-token', 'accessToken')
          .stores('refresh-token', 'refreshToken');
      });
    });

    describe('POST /auth/local/signin', () => {
      const signinRequest = () => spec().post('/auth/local/signin');
      const signinDto: SigninDto = {
        email: 'johndoe@gmail.com',
        password: 'Johndoe@123',
      };

      it('should throw an error if email is not provided in the body', () => {
        const dto: Omit<SigninDto, 'email'> = {
          password: signinDto.password,
        };

        return signinRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if password is not provided in the body', () => {
        const dto: Omit<SigninDto, 'password'> = {
          email: signinDto.email,
        };

        return signinRequest().withBody(dto).expectStatus(400);
      });

      it('should throw an error if there is no user with the provided email', () => {
        const dto: SigninDto = {
          email: 'test@test.com',
          password: signinDto.password,
        };

        return signinRequest().withBody(dto).expectStatus(403);
      });

      it('should throw an error if provided password is invalid', () => {
        const dto: SigninDto = {
          email: signinDto.email,
          password: 'Test@1234',
        };

        return signinRequest().withBody(dto).expectStatus(403);
      });

      it('should signin', () => {
        return signinRequest()
          .withBody(signinDto)
          .expectStatus(200)
          .stores('access-token', 'accessToken')
          .stores('refresh-token', 'refreshToken');
      });
    });

    describe('GET /auth/user', () => {
      const getUserRequest = () => spec().get('/auth/user');

      it('should throw an error if access token not provided as authorization bearer', () => {
        return getUserRequest().expectStatus(401);
      });

      it('should get user details', () => {
        return getUserRequest()
          .withBearerToken('$S{access-token}')
          .expectStatus(200)
          .stores('userId', '_id');
      });
    });

    describe('POST /auth/refresh', () => {
      const refreshRequest = () => spec().post('/auth/refresh');

      it('should throw an error if refresh token not provided as authorization bearer', () => {
        return refreshRequest().expectStatus(401);
      });

      it('should throw an error if access token is provided instead of refresh token as authorization bearer', () => {
        return refreshRequest()
          .withBearerToken('$S{access-token}')
          .expectStatus(401);
      });

      it('should refresh the token', () => {
        return refreshRequest()
          .withBearerToken('$S{refresh-token}')
          .expectStatus(201)
          .stores('access-token', 'accessToken')
          .stores('refresh-token', 'refreshToken');
      });
    });

    describe('PATCH /auth/user/edit', () => {
      const editUserRequest = () => spec().patch('/auth/user/edit');
      const editUserDto: EditUserDto = {
        name: 'John Smith',
      };

      it('should throw an error if access token not provided as authorization bearer', () => {
        return editUserRequest().withBody(editUserDto).expectStatus(401);
      });

      it('should edit user', () => {
        return editUserRequest()
          .withBearerToken('$S{access-token}')
          .withBody(editUserDto)
          .expectStatus(200);
      });
    });

    describe('PATCH /auth/user/password', () => {
      const changePasswordRequest = () => spec().patch('/auth/user/password');
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'Johndoe@123',
        newPassword: 'John@123',
      };

      it('should throw an error if access token not provided as authorization bearer', () => {
        return changePasswordRequest()
          .withBody(changePasswordDto)
          .expectStatus(401);
      });

      it('should throw an error if currentPassword is not provided in the body', () => {
        const dto: Omit<ChangePasswordDto, 'currentPassword'> = {
          newPassword: changePasswordDto.newPassword,
        };

        return changePasswordRequest()
          .withBearerToken('$S{access-token}')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw an error if newPassword is not provided in the body', () => {
        const dto: Omit<ChangePasswordDto, 'newPassword'> = {
          currentPassword: changePasswordDto.currentPassword,
        };

        return changePasswordRequest()
          .withBearerToken('$S{access-token}')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should change password', () => {
        return changePasswordRequest()
          .withBearerToken('$S{access-token}')
          .withBody(changePasswordDto)
          .expectStatus(200)
          .expectBodyContains(changePasswordDto.currentPassword)
          .expectBodyContains(changePasswordDto.newPassword);
      });
    });

    describe('DELETE /auth/signout', () => {
      const signoutRequest = () => spec().delete('/auth/signout');

      it('should throw an error if access token not provided as authorization bearer', () => {
        return signoutRequest().expectStatus(401);
      });

      it('should signout the user', () => {
        return signoutRequest()
          .withBearerToken('$S{access-token}')
          .expectStatus(204);
      });
    });
  });
});
