import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  // bcrypt é um módulo nativo — jest.spyOn não consegue redefinir suas
  // propriedades, então os testes de login usam um hash real (cost baixo,
  // só para acelerar a suíte) em vez de mockar bcrypt.compare.
  const CORRECT_PASSWORD = 'senhaCorreta123';
  const dbUser = {
    id: 'user-1',
    name: 'Rafael',
    email: 'rafael@example.com',
    password: bcrypt.hashSync(CORRECT_PASSWORD, 4),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed.jwt.token'),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('register', () => {
    it('rejeita e-mail já cadastrado', async () => {
      usersService.findByEmail.mockResolvedValue(dbUser);

      await expect(
        service.register({
          name: 'Rafael',
          email: dbUser.email,
          password: 'segredo123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, não um método real
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('hasheia a senha antes de persistir e nunca guarda a senha em claro', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(dbUser);

      await service.register({
        name: 'Rafael',
        email: 'novo@example.com',
        password: 'segredo123',
      });

      const [createArg] = usersService.create.mock.calls[0];
      expect(createArg.password).not.toBe('segredo123');
      expect(await bcrypt.compare('segredo123', createArg.password)).toBe(true);
    });

    it('não expõe a senha na resposta de autenticação', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(dbUser);

      const result = await service.register({
        name: 'Rafael',
        email: dbUser.email,
        password: 'segredo123',
      });

      expect(result.user).toEqual({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
      });
      expect(result.user).not.toHaveProperty('password');
      expect(result.accessToken).toBe('signed.jwt.token');
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, não um método real
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: dbUser.id,
        email: dbUser.email,
      });
    });
  });

  describe('login', () => {
    it('rejeita usuário inexistente com a mesma mensagem de senha incorreta', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ninguem@example.com', password: 'x' }),
      ).rejects.toMatchObject({
        message: 'Credenciais inválidas',
      });
    });

    it('rejeita senha incorreta com a mesma mensagem de usuário inexistente', async () => {
      usersService.findByEmail.mockResolvedValue(dbUser);

      await expect(
        service.login({ email: dbUser.email, password: 'errada' }),
      ).rejects.toMatchObject({
        message: 'Credenciais inválidas',
      });
    });

    it('ambos os casos de falha lançam UnauthorizedException (sem enumeração de usuário)', async () => {
      usersService.findByEmail.mockResolvedValueOnce(null);
      await expect(
        service.login({ email: 'a@a.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      usersService.findByEmail.mockResolvedValueOnce(dbUser);
      await expect(
        service.login({ email: dbUser.email, password: 'errada' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('autentica com credenciais corretas', async () => {
      usersService.findByEmail.mockResolvedValue(dbUser);

      const result = await service.login({
        email: dbUser.email,
        password: CORRECT_PASSWORD,
      });

      expect(result.user.id).toBe(dbUser.id);
      expect(result.accessToken).toBe('signed.jwt.token');
    });
  });
});
